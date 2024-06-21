#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { Myblogv2Stack } from "../lib/myblogv2-stack";
import { MyBlogParamV2 } from "../lib/parameters";

const param = new MyBlogParamV2();

const app = new cdk.App();
new Myblogv2Stack(app, "Myblogv2Stack", {
  env: { region: param.env.region },
});
