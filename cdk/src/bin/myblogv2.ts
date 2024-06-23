#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { Myblogv2Stack } from "../lib/myblogv2-stack";
import { Myblogv2Stack2 } from "../lib/myblogv2-stack2";
import { Myblogv2Stack3 } from "../lib/myblogv2-stack3";
import { MyBlogParamV2 } from "../lib/parameters";
import * as apigw from "aws-cdk-lib/aws-apigateway";

const param = new MyBlogParamV2();
const app = new cdk.App();
const stack1 = new Myblogv2Stack(app, "Myblogv2Stack", {
  env: { region: param.env.region },
});
const stack2 = new Myblogv2Stack2(app, "Myblogv2Stack2", {
  env: { region: param.env.region },
});
const stack3 = new Myblogv2Stack3(app, "Myblogv2Stack3", {
  env: { region: param.env.region },
});
stack1.addDependency(stack2);
