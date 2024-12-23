# To handle the docker container:

```
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 593793061939.dkr.ecr.us-east-1.amazonaws.com

docker build -t phpmyfunction .
docker buildx build --platform linux/amd64 -t phpmyfunction .

docker buildx build --platform linux/amd64 -t 593793061939.dkr.ecr.us-east-1.amazonaws.com/phpmyfunction:latest .
docker push 593793061939.dkr.ecr.us-east-1.amazonaws.com/phpmyfunction:latest

docker tag phpmyfunction:latest 593793061939.dkr.ecr.us-east-1.amazonaws.com/phpmyfunction:latest

```

# If needed to delete the previous stack

```
aws cloudformation delete-stack --stack-name phpmyfunction-stack --region us-east-1
```

# To deploy the lambda function when setup

```
sam package \
    --template-file template.yml \
    --output-template-file packaged.yml \
    --image-repository 593793061939.dkr.ecr.us-east-1.amazonaws.com/phpmyfunction

sam deploy \
    --template-file packaged.yml \
    --stack-name phpmyfunction-stack \
    --capabilities CAPABILITY_IAM \
    --resolve-image-repos
```
