import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as CodeBuild from 'aws-cdk-lib/aws-codebuild';
import * as CodePipeline from 'aws-cdk-lib/aws-codepipeline';
import * as CodePipelineAction from 'aws-cdk-lib/aws-codepipeline-actions'

export class CloudInfraStack extends cdk.Stack {
  s3WebsiteBucket: s3.Bucket;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // TO DO: Please replace the s3 Bucket name to a unique name of your choice.
    const websiteBucket = new s3.Bucket(this, "KloudPod-s3-website", {
      websiteIndexDocument: "index.html",
      websiteErrorDocument: "error.html",
      versioned: true,
      publicReadAccess: true,
    });

    const outputSource = new CodePipeline.Artifact();
    const outputWebsite = new CodePipeline.Artifact();

    const pipeline = new CodePipeline.Pipeline(this, "Pipeline", {
      pipelineName: "ReactStaticWebCICDPipeline",
      restartExecutionOnUpdate: true,
    });

    // TO DO: Please replace the connectionArn value with your codestar connection arn
    pipeline.addStage({
      stageName: "Source",
      actions: [
        new CodePipelineAction.CodeStarConnectionsSourceAction({
          actionName: "Github_Source",
          owner: "KloudPod",
          repo: "kloudpod-web-ui",
          branch: "main",
          output: outputSource,
          connectionArn: "arn:aws:codestar-connections:us-east-1:853232536111:connection/832612df-aa20-4957-9d21-d8e19178003c",
        })
      ]
    });

    pipeline.addStage({
      stageName: "Build",
      actions: [
        new CodePipelineAction.CodeBuildAction({
          actionName: "Build-UI",
          project: new CodeBuild.PipelineProject(this, "UIBuild", {
            environment: {
              buildImage: CodeBuild.LinuxBuildImage.AMAZON_LINUX_2_4,
              privileged: true,
              computeType: CodeBuild.ComputeType.SMALL,
            },
            projectName: "StaticWebsiteBuild",
            buildSpec: CodeBuild.BuildSpec.fromSourceFilename("./buildspec.yml"),
          }),
          input: outputSource,
          outputs: [outputWebsite]
        })
      ],
    });

    pipeline.addStage({
      stageName: "Deploy",
      actions: [
        new CodePipelineAction.S3DeployAction({
          actionName: "DeployingStaticWebsite",
          input: outputWebsite,
          bucket: websiteBucket,
        })
      ]
    });

    this.s3WebsiteBucket = websiteBucket;
  }
}
