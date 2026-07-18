# Restaurant Service Runtime Stack

This stack creates only the restaurant-service ECS Fargate task definition
and service. It attaches to infrastructure created elsewhere instead of
owning it:

- ECR repository: created manually, not by this stack
  (`delivery-service/restaraunt-service`).
- ECS cluster, internal ALB, target group, and task security group: created
  by the `food-delivery-preview-platform` stack in the
  `food-delivery-infrastructure` repository.

This stack itself creates only:

- ECS Fargate task definition
- ECS service (attached to the existing cluster/target group/security group)
- CloudWatch log group
- ECS task execution role and task role

Stack name must be exactly `restaurant-service-runtime`. The shared cleanup
automation in `food-delivery-infrastructure` only knows how to delete that
exact name, `delivery-service-runtime`, and `food-delivery-preview-platform`.

## Lifecycle

The `food-delivery-preview-platform` stack (and this stack's cluster/ALB/
target group dependencies) only exist for a limited time — someone runs the
`food-delivery-infrastructure` repo's "Deploy delivery and restaurant
preview" workflow with a `lifetime_minutes` input (default 60), and an
EventBridge Scheduler one-time rule deletes everything after that.

This repo's deploy workflow does not create or extend that lifetime. It
only checks whether `food-delivery-preview-platform` currently exists and
is healthy:

- If it is running: build and push the image to ECR, then deploy/update
  `restaurant-service-runtime` with the new `ImageUri`, which forces a new
  ECS task-definition revision and a rolling service update.
- If it is not running (already cleaned up, or never deployed): the image
  is still pushed to ECR, but the CloudFormation deploy step is skipped —
  there is no cluster, target group, or security group to attach to.

## Prerequisites

- `AWS_ROLE_TO_ASSUME` GitHub secret: role with permission to push to the
  `delivery-service/restaraunt-service` ECR repository, read
  `food-delivery-preview-platform` stack outputs, and deploy/update the
  `restaurant-service-runtime` stack (including `iam:PassRole` for the task
  execution and task roles it creates).
- `DATABASE_SECRET_ARN` GitHub secret: ARN of the Secrets Manager secret
  containing `RESTAURANT_DB_URL`. Passed to the stack as the
  `DatabaseSecretArn` parameter on every deploy — the ARN has no default in
  `cloudformation.yml` and never lives in source control.
- The database secret must already exist in Secrets Manager with a JSON
  value containing:

  ```json
  {
    "RESTAURANT_DB_URL": "postgresql://user:password@host:5432/database"
  }
  ```

## Manual Deploy

Only useful while `food-delivery-preview-platform` is running. Fetch its
outputs first:

```bash
aws cloudformation describe-stacks \
  --stack-name food-delivery-preview-platform \
  --query "Stacks[0].Outputs"
```

Then:

```bash
aws cloudformation deploy \
  --stack-name restaurant-service-runtime \
  --template-file infra/cloudformation.yml \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameter-overrides \
    ClusterName=<ClusterName> \
    TargetGroupArn=<RestaurantTargetGroupArn> \
    TaskSecurityGroupId=<RestaurantTaskSecurityGroupId> \
    SubnetIds=<SubnetIds> \
    ImageUri=<image> \
    DatabaseSecretArn=<DatabaseSecretArn>
```

Application images are tagged with the Git commit SHA, so deployed
revisions do not use `latest`.
