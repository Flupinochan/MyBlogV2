"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MyBlogParam2V2 = void 0;
class MyBlogParam2V2 {
    constructor() {
        this.lambda = {
            functionName: "metalmental-myblogv2-lambda-chat",
            logGroupName: "metalmental-myblogv2-lambda-logs-chat",
            roleName: "metalmental-myblogv2-lambda-role-chat",
            layerName: "metalmental-myblogv2-lambda-layer-chat",
            functionName2: "metalmental-myblogv2-websocket-lambda-db",
            logGroupName2: "metalmental-myblogv2-websocket-lambda-logs-db",
        };
        this.apiGateway = {
            logGroupName: "metalmental-myblogv2-apigw-logs",
            apiName: "metalmental-myblogv2-apigw",
        };
        this.dynamodb = {
            tableName: "metalmental-myblogv2-db",
            primaryKeyName: "id",
        };
    }
}
exports.MyBlogParam2V2 = MyBlogParam2V2;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyYW1ldGVyczIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbGliL3BhcmFtZXRlcnMyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLE1BQWEsY0FBYztJQUEzQjtRQUNFLFdBQU0sR0FBRztZQUNQLFlBQVksRUFBRSxrQ0FBa0M7WUFDaEQsWUFBWSxFQUFFLHVDQUF1QztZQUNyRCxRQUFRLEVBQUUsdUNBQXVDO1lBQ2pELFNBQVMsRUFBRSx3Q0FBd0M7WUFDbkQsYUFBYSxFQUFFLDBDQUEwQztZQUN6RCxhQUFhLEVBQUUsK0NBQStDO1NBQy9ELENBQUM7UUFDRixlQUFVLEdBQUc7WUFDWCxZQUFZLEVBQUUsaUNBQWlDO1lBQy9DLE9BQU8sRUFBRSw0QkFBNEI7U0FDdEMsQ0FBQztRQUNGLGFBQVEsR0FBRztZQUNULFNBQVMsRUFBRSx5QkFBeUI7WUFDcEMsY0FBYyxFQUFFLElBQUk7U0FDckIsQ0FBQTtJQUNILENBQUM7Q0FBQTtBQWpCRCx3Q0FpQkMiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgY2xhc3MgTXlCbG9nUGFyYW0yVjIge1xuICBsYW1iZGEgPSB7XG4gICAgZnVuY3Rpb25OYW1lOiBcIm1ldGFsbWVudGFsLW15YmxvZ3YyLWxhbWJkYS1jaGF0XCIsXG4gICAgbG9nR3JvdXBOYW1lOiBcIm1ldGFsbWVudGFsLW15YmxvZ3YyLWxhbWJkYS1sb2dzLWNoYXRcIixcbiAgICByb2xlTmFtZTogXCJtZXRhbG1lbnRhbC1teWJsb2d2Mi1sYW1iZGEtcm9sZS1jaGF0XCIsXG4gICAgbGF5ZXJOYW1lOiBcIm1ldGFsbWVudGFsLW15YmxvZ3YyLWxhbWJkYS1sYXllci1jaGF0XCIsXG4gICAgZnVuY3Rpb25OYW1lMjogXCJtZXRhbG1lbnRhbC1teWJsb2d2Mi13ZWJzb2NrZXQtbGFtYmRhLWRiXCIsXG4gICAgbG9nR3JvdXBOYW1lMjogXCJtZXRhbG1lbnRhbC1teWJsb2d2Mi13ZWJzb2NrZXQtbGFtYmRhLWxvZ3MtZGJcIixcbiAgfTtcbiAgYXBpR2F0ZXdheSA9IHtcbiAgICBsb2dHcm91cE5hbWU6IFwibWV0YWxtZW50YWwtbXlibG9ndjItYXBpZ3ctbG9nc1wiLFxuICAgIGFwaU5hbWU6IFwibWV0YWxtZW50YWwtbXlibG9ndjItYXBpZ3dcIixcbiAgfTtcbiAgZHluYW1vZGIgPSB7XG4gICAgdGFibGVOYW1lOiBcIm1ldGFsbWVudGFsLW15YmxvZ3YyLWRiXCIsXG4gICAgcHJpbWFyeUtleU5hbWU6IFwiaWRcIixcbiAgfVxufVxuIl19