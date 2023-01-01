import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import { CloudInfraStack } from './cloud-infra-stack';

export class CDNStack extends cdk.Stack {
    constructor(scope: Construct, id: string, cloudinfrastack: CloudInfraStack, props?: cdk.StackProps) {
        super(scope, id, props);

        const cdn = new cloudfront.Distribution(this, 's3Cloudfront', {
            defaultBehavior: {
                origin: new origins.S3Origin(cloudinfrastack.s3WebsiteBucket)
            }
        });
    }
}