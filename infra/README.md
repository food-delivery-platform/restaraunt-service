# Menu Service AWS Stack

This stack creates the AWS runtime for the Dockerized endpoint service:

- ECR repository
- ECS Fargate task definition and service running in an existing cluster
- ECS target-tracking auto scaling based on average CPU utilization
- Application Load Balancer with `/health` target checks
- CloudWatch log group
- ECS task execution role and task role

GitHub Actions deploys by running CloudFormation. ECS is not updated directly by the workflow.

## Prerequisites

This stack assumes the GitHub deploy role already exists outside this service stack. Store that role ARN in GitHub as `AWS_ROLE_TO_ASSUME`.

It also assumes the `food-delivery-preview-cluster` ECS cluster already exists.
You can override that default with the `EcsClusterName` CloudFormation parameter.

That external role needs permission to:

- push images to the service ECR repository
- run `aws cloudformation deploy` for this stack
- create/update the resources in this template
- pass the ECS task execution role and task role

Create the database secret first. Its JSON value must contain:

```json
{
  "RESTAURANT_DB_URL": "postgresql://user:password@host:5432/database"
}
```

## Deploy Stack Manually

```bash
aws cloudformation deploy \
  --stack-name menu-service-prod \
  --template-file infra/cloudformation.yml \
  --capabilities CAPABILITY_NAMED_IAM
```

CloudFormation keeps the service at zero tasks while it uses the bootstrap image.
GitHub Actions later deploys the real image by passing
`ImageUri=<new pushed image>`, which enables the configured desired count and
autoscaling minimum.

The bootstrap task definition uses the fixed `busybox:1.36.1` tag. Application
images are tagged with the Git commit SHA, so deployed revisions do not use
`latest`.

## GitHub Settings

```text
Secret:
AWS_ROLE_TO_ASSUME=<existing GitHub deploy role ARN>
```

## Push Deployment

After the GitHub settings exist, every push to `main` runs:

1. `npm run check`
2. Docker build
3. Docker push to ECR
4. `aws cloudformation deploy` with `ImageUri=<new pushed image>`

CloudFormation updates the ECS task definition and service.

Application Auto Scaling keeps the service between the configured minimum and
maximum task counts. It adds tasks when average service CPU is above the target
and removes tasks after utilization falls below it. Scale-out has a 60-second
cooldown; scale-in has a 300-second cooldown to reduce task-count churn.
