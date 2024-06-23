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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyYW1ldGVycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9saWIvcGFyYW1ldGVycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxNQUFhLGFBQWE7SUFBMUI7UUFDRSxRQUFHLEdBQUc7WUFDSixNQUFNLEVBQUUsV0FBVztTQUNwQixDQUFDO1FBRUYsT0FBRSxHQUFHO1lBQ0gsVUFBVSxFQUFFLHNCQUFzQjtTQUNuQyxDQUFDO1FBQ0YsZUFBVSxHQUFHO1lBQ1gsY0FBYyxFQUFFLHFGQUFxRjtZQUNyRyxPQUFPLEVBQUUsMEJBQTBCO1NBQ3BDLENBQUM7UUFDRixhQUFRLEdBQUc7WUFDVCxhQUFhLEVBQUUsZ0NBQWdDO1lBQy9DLGlCQUFpQixFQUFFLHFDQUFxQztZQUN4RCxpQkFBaUIsRUFBRSxxQ0FBcUM7WUFDeEQsWUFBWSxFQUFFLCtCQUErQjtZQUM3QyxNQUFNLEVBQUUsd0NBQXdDO1lBQ2hELHFCQUFxQixFQUFFLDBHQUEwRztTQUNsSSxDQUFDO0lBQ0osQ0FBQztDQUFBO0FBcEJELHNDQW9CQyIsInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBjbGFzcyBNeUJsb2dQYXJhbVYyIHtcbiAgZW52ID0ge1xuICAgIHJlZ2lvbjogXCJ1cy13ZXN0LTJcIixcbiAgfTtcblxuICBzMyA9IHtcbiAgICBidWNrZXROYW1lOiBcIm1ldGFsbWVudGFsLW15YmxvZ3YyXCIsXG4gIH07XG4gIGNsb3VkZnJvbnQgPSB7XG4gICAgY2VydGlmaWNhdGVBcm46IFwiYXJuOmF3czphY206dXMtZWFzdC0xOjI0NzU3NDI0NjE2MDpjZXJ0aWZpY2F0ZS9hNzVmNjlhMi00MmU0LTRhY2EtYjdiOS0zNDgzMDU0NzQyMzdcIixcbiAgICBvYWNOYW1lOiBcIm1ldGFsbWVudGFsLW15YmxvZ3YyLW9hY1wiLFxuICB9O1xuICBwaXBlbGluZSA9IHtcbiAgICBjb2RlYnVpbGROYW1lOiBcIm1ldGFsbWVudGFsLW15YmxvZ3YyLWNvZGVidWlsZFwiLFxuICAgIGNvZGVidWlsZExvZ3NOYW1lOiBcIm1ldGFsbWVudGFsLW15YmxvZ3YyLWNvZGVidWlsZC1sb2dzXCIsXG4gICAgY29kZWJ1aWxkUm9sZU5hbWU6IFwibWV0YWxtZW50YWwtbXlibG9ndjItY29kZWJ1aWxkLXJvbGVcIixcbiAgICBwaXBlbGluZU5hbWU6IFwibWV0YWxtZW50YWwtbXlibG9ndjItcGlwZWxpbmVcIixcbiAgICBzM05hbWU6IFwibWV0YWxtZW50YWwtbXlibG9ndjItcGlwZWxpbmUtYXJ0aWZhY3RcIixcbiAgICBjb2Rlc3RhckNvbm5lY3Rpb25Bcm46IFwiYXJuOmF3czpjb2Rlc3Rhci1jb25uZWN0aW9uczphcC1ub3J0aGVhc3QtMToyNDc1NzQyNDYxNjA6Y29ubmVjdGlvbi9iYmEzZTg3Zi0yOGY2LTQ1ZjQtYTQxMC0zZmQ3MjYxNjBmNzBcIixcbiAgfTtcbn1cbiJdfQ==