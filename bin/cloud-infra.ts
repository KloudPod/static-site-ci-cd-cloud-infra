#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CloudInfraStack } from '../lib/cloud-infra-stack';
import { CDNStack } from '../lib/cdn-stack';

const app = new cdk.App();
const cloudInfraStack = new CloudInfraStack(app, 'CloudInfraStack', {
});
const cdnStack = new CDNStack(app, 'CDNStack', cloudInfraStack, {});
cdnStack.addDependency(cloudInfraStack);