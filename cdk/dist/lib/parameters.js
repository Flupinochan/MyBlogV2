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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyYW1ldGVycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9saWIvcGFyYW1ldGVycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxNQUFhLGFBQWE7SUFBMUI7UUFDRSxRQUFHLEdBQUc7WUFDSixNQUFNLEVBQUUsV0FBVztTQUNwQixDQUFDO1FBRUYsT0FBRSxHQUFHO1lBQ0gsVUFBVSxFQUFFLHNCQUFzQjtTQUNuQyxDQUFDO1FBQ0YsZUFBVSxHQUFHO1lBQ1gsY0FBYyxFQUFFLEVBQUU7WUFDbEIsT0FBTyxFQUFFLDBCQUEwQjtTQUNwQyxDQUFDO1FBQ0YsYUFBUSxHQUFHO1lBQ1QsYUFBYSxFQUFFLGdDQUFnQztZQUMvQyxpQkFBaUIsRUFBRSxxQ0FBcUM7WUFDeEQsaUJBQWlCLEVBQUUscUNBQXFDO1lBQ3hELFlBQVksRUFBRSwrQkFBK0I7WUFDN0MsTUFBTSxFQUFFLHdDQUF3QztZQUNoRCxxQkFBcUIsRUFBRSxFQUFFO1NBQzFCLENBQUM7SUFDSixDQUFDO0NBQUE7QUFwQkQsc0NBb0JDIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGNsYXNzIE15QmxvZ1BhcmFtVjIge1xuICBlbnYgPSB7XG4gICAgcmVnaW9uOiBcInVzLXdlc3QtMlwiLFxuICB9O1xuXG4gIHMzID0ge1xuICAgIGJ1Y2tldE5hbWU6IFwibWV0YWxtZW50YWwtbXlibG9ndjJcIixcbiAgfTtcbiAgY2xvdWRmcm9udCA9IHtcbiAgICBjZXJ0aWZpY2F0ZUFybjogXCJcIixcbiAgICBvYWNOYW1lOiBcIm1ldGFsbWVudGFsLW15YmxvZ3YyLW9hY1wiLFxuICB9O1xuICBwaXBlbGluZSA9IHtcbiAgICBjb2RlYnVpbGROYW1lOiBcIm1ldGFsbWVudGFsLW15YmxvZ3YyLWNvZGVidWlsZFwiLFxuICAgIGNvZGVidWlsZExvZ3NOYW1lOiBcIm1ldGFsbWVudGFsLW15YmxvZ3YyLWNvZGVidWlsZC1sb2dzXCIsXG4gICAgY29kZWJ1aWxkUm9sZU5hbWU6IFwibWV0YWxtZW50YWwtbXlibG9ndjItY29kZWJ1aWxkLXJvbGVcIixcbiAgICBwaXBlbGluZU5hbWU6IFwibWV0YWxtZW50YWwtbXlibG9ndjItcGlwZWxpbmVcIixcbiAgICBzM05hbWU6IFwibWV0YWxtZW50YWwtbXlibG9ndjItcGlwZWxpbmUtYXJ0aWZhY3RcIixcbiAgICBjb2Rlc3RhckNvbm5lY3Rpb25Bcm46IFwiXCIsXG4gIH07XG59XG4iXX0=