export class MyBlogParamV2 {
  env = {
    region: "us-west-2",
  };

  s3 = {
    bucketName: "metalmental-myblogv2",
  };
  cloudfront = {
    certificateArn: "",
    oacName: "metalmental-myblogv2-oac",
  };
  pipeline = {
    codebuildName: "metalmental-myblogv2-codebuild",
    codebuildLogsName: "metalmental-myblogv2-codebuild-logs",
    codebuildRoleName: "metalmental-myblogv2-codebuild-role",
    pipelineName: "metalmental-myblogv2-pipeline",
    s3Name: "metalmental-myblogv2-pipeline-artifact",
    codestarConnectionArn: "",
  };
}
