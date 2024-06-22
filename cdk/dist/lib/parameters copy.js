"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MyBlogParamV2 = void 0;
class MyBlogParamV2 {
    constructor() {
        this.env = {
            region: "us-west-2",
        };
        this.s3 = {
            bucketName: "metalmental-myblogv2",
        };
        this.cloudfront = {
            certificateArn: "",
            oacName: "metalmental-myblogv2-oac",
        };
        this.pipeline = {
            codebuildName: "metalmental-myblogv2-codebuild",
            codebuildLogsName: "metalmental-myblogv2-codebuild-logs",
            codebuildRoleName: "metalmental-myblogv2-codebuild-role",
            pipelineName: "metalmental-myblogv2-pipeline",
            s3Name: "metalmental-myblogv2-pipeline-artifact",
            codestarConnectionArn: "",
        };
    }
}
exports.MyBlogParamV2 = MyBlogParamV2;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyYW1ldGVycyBjb3B5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2xpYi9wYXJhbWV0ZXJzIGNvcHkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsTUFBYSxhQUFhO0lBQTFCO1FBQ0UsUUFBRyxHQUFHO1lBQ0osTUFBTSxFQUFFLFdBQVc7U0FDcEIsQ0FBQztRQUVGLE9BQUUsR0FBRztZQUNILFVBQVUsRUFBRSxzQkFBc0I7U0FDbkMsQ0FBQztRQUNGLGVBQVUsR0FBRztZQUNYLGNBQWMsRUFBRSxFQUFFO1lBQ2xCLE9BQU8sRUFBRSwwQkFBMEI7U0FDcEMsQ0FBQztRQUNGLGFBQVEsR0FBRztZQUNULGFBQWEsRUFBRSxnQ0FBZ0M7WUFDL0MsaUJBQWlCLEVBQUUscUNBQXFDO1lBQ3hELGlCQUFpQixFQUFFLHFDQUFxQztZQUN4RCxZQUFZLEVBQUUsK0JBQStCO1lBQzdDLE1BQU0sRUFBRSx3Q0FBd0M7WUFDaEQscUJBQXFCLEVBQUUsRUFBRTtTQUMxQixDQUFDO0lBQ0osQ0FBQztDQUFBO0FBcEJELHNDQW9CQyIsInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBjbGFzcyBNeUJsb2dQYXJhbVYyIHtcbiAgZW52ID0ge1xuICAgIHJlZ2lvbjogXCJ1cy13ZXN0LTJcIixcbiAgfTtcblxuICBzMyA9IHtcbiAgICBidWNrZXROYW1lOiBcIm1ldGFsbWVudGFsLW15YmxvZ3YyXCIsXG4gIH07XG4gIGNsb3VkZnJvbnQgPSB7XG4gICAgY2VydGlmaWNhdGVBcm46IFwiXCIsXG4gICAgb2FjTmFtZTogXCJtZXRhbG1lbnRhbC1teWJsb2d2Mi1vYWNcIixcbiAgfTtcbiAgcGlwZWxpbmUgPSB7XG4gICAgY29kZWJ1aWxkTmFtZTogXCJtZXRhbG1lbnRhbC1teWJsb2d2Mi1jb2RlYnVpbGRcIixcbiAgICBjb2RlYnVpbGRMb2dzTmFtZTogXCJtZXRhbG1lbnRhbC1teWJsb2d2Mi1jb2RlYnVpbGQtbG9nc1wiLFxuICAgIGNvZGVidWlsZFJvbGVOYW1lOiBcIm1ldGFsbWVudGFsLW15YmxvZ3YyLWNvZGVidWlsZC1yb2xlXCIsXG4gICAgcGlwZWxpbmVOYW1lOiBcIm1ldGFsbWVudGFsLW15YmxvZ3YyLXBpcGVsaW5lXCIsXG4gICAgczNOYW1lOiBcIm1ldGFsbWVudGFsLW15YmxvZ3YyLXBpcGVsaW5lLWFydGlmYWN0XCIsXG4gICAgY29kZXN0YXJDb25uZWN0aW9uQXJuOiBcIlwiLFxuICB9O1xufVxuIl19