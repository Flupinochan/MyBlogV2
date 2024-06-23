"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MyBlogParam4V2 = void 0;
class MyBlogParam4V2 {
    constructor() {
        this.lambda = {
            functionName: "metalmental-myblogv2-websocket-lambda",
            roleName: "metalmental-myblogv2-websocket-lambda-role",
            logGroupName: "metalmental-myblogv2-websocket-lambda-logs",
            layerName: "metalmental-myblogv2-websocket-lambda-layer",
        };
        this.stepFunctions = {
            stateMachineName: "metalmental-myblogv2-websocket-sfn",
            roleName: "metalmental-myblogv2-websocket-sfn-role",
            logGroupName: "metalmental-myblogv2-websocket-sfn-logs",
        };
        this.websocket = {
            apiName: "metalmental-myblogv2-websocket-api",
            stageName: "websocket",
            roleName: "metalmental-myblogv2-websocket-api-role",
        };
    }
}
exports.MyBlogParam4V2 = MyBlogParam4V2;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyYW1ldGVyczQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbGliL3BhcmFtZXRlcnM0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLE1BQWEsY0FBYztJQUEzQjtRQUNFLFdBQU0sR0FBRztZQUNQLFlBQVksRUFBRSx1Q0FBdUM7WUFDckQsUUFBUSxFQUFFLDRDQUE0QztZQUN0RCxZQUFZLEVBQUUsNENBQTRDO1lBQzFELFNBQVMsRUFBRSw2Q0FBNkM7U0FDekQsQ0FBQztRQUNGLGtCQUFhLEdBQUc7WUFDZCxnQkFBZ0IsRUFBRSxvQ0FBb0M7WUFDdEQsUUFBUSxFQUFFLHlDQUF5QztZQUNuRCxZQUFZLEVBQUUseUNBQXlDO1NBQ3hELENBQUM7UUFDRixjQUFTLEdBQUc7WUFDVixPQUFPLEVBQUUsb0NBQW9DO1lBQzdDLFNBQVMsRUFBRSxXQUFXO1lBQ3RCLFFBQVEsRUFBRSx5Q0FBeUM7U0FDcEQsQ0FBQztJQUNKLENBQUM7Q0FBQTtBQWpCRCx3Q0FpQkMiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgY2xhc3MgTXlCbG9nUGFyYW00VjIge1xuICBsYW1iZGEgPSB7XG4gICAgZnVuY3Rpb25OYW1lOiBcIm1ldGFsbWVudGFsLW15YmxvZ3YyLXdlYnNvY2tldC1sYW1iZGFcIixcbiAgICByb2xlTmFtZTogXCJtZXRhbG1lbnRhbC1teWJsb2d2Mi13ZWJzb2NrZXQtbGFtYmRhLXJvbGVcIixcbiAgICBsb2dHcm91cE5hbWU6IFwibWV0YWxtZW50YWwtbXlibG9ndjItd2Vic29ja2V0LWxhbWJkYS1sb2dzXCIsXG4gICAgbGF5ZXJOYW1lOiBcIm1ldGFsbWVudGFsLW15YmxvZ3YyLXdlYnNvY2tldC1sYW1iZGEtbGF5ZXJcIixcbiAgfTtcbiAgc3RlcEZ1bmN0aW9ucyA9IHtcbiAgICBzdGF0ZU1hY2hpbmVOYW1lOiBcIm1ldGFsbWVudGFsLW15YmxvZ3YyLXdlYnNvY2tldC1zZm5cIixcbiAgICByb2xlTmFtZTogXCJtZXRhbG1lbnRhbC1teWJsb2d2Mi13ZWJzb2NrZXQtc2ZuLXJvbGVcIixcbiAgICBsb2dHcm91cE5hbWU6IFwibWV0YWxtZW50YWwtbXlibG9ndjItd2Vic29ja2V0LXNmbi1sb2dzXCIsXG4gIH07XG4gIHdlYnNvY2tldCA9IHtcbiAgICBhcGlOYW1lOiBcIm1ldGFsbWVudGFsLW15YmxvZ3YyLXdlYnNvY2tldC1hcGlcIixcbiAgICBzdGFnZU5hbWU6IFwid2Vic29ja2V0XCIsXG4gICAgcm9sZU5hbWU6IFwibWV0YWxtZW50YWwtbXlibG9ndjItd2Vic29ja2V0LWFwaS1yb2xlXCIsXG4gIH07XG59XG4iXX0=