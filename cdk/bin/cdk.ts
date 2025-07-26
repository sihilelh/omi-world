#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { CommonStack } from "../lib/common-stack";
import { RouteStack } from "../lib/route-stack";

const app = new cdk.App();

// Handles Cognito and Dynamo DB related things
new CommonStack(app, "CommonStack");

// Handles API Gateway and Lambda Functions
new RouteStack(app, "RouteStack");
