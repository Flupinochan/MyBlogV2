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
            functionName3: "metalmental-myblogv2-ses-lambda",
            logGroupName3: "metalmental-myblogv2-ses-logs",
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyYW1ldGVyczIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbGliL3BhcmFtZXRlcnMyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLE1BQWEsY0FBYztJQUEzQjtRQUNFLFdBQU0sR0FBRztZQUNQLFlBQVksRUFBRSxrQ0FBa0M7WUFDaEQsWUFBWSxFQUFFLHVDQUF1QztZQUNyRCxRQUFRLEVBQUUsdUNBQXVDO1lBQ2pELFNBQVMsRUFBRSx3Q0FBd0M7WUFDbkQsYUFBYSxFQUFFLDBDQUEwQztZQUN6RCxhQUFhLEVBQUUsK0NBQStDO1lBQzlELGFBQWEsRUFBRSxpQ0FBaUM7WUFDaEQsYUFBYSxFQUFFLCtCQUErQjtTQUMvQyxDQUFDO1FBQ0YsZUFBVSxHQUFHO1lBQ1gsWUFBWSxFQUFFLGlDQUFpQztZQUMvQyxPQUFPLEVBQUUsNEJBQTRCO1NBQ3RDLENBQUM7UUFDRixhQUFRLEdBQUc7WUFDVCxTQUFTLEVBQUUseUJBQXlCO1lBQ3BDLGNBQWMsRUFBRSxJQUFJO1NBQ3JCLENBQUM7SUFDSixDQUFDO0NBQUE7QUFuQkQsd0NBbUJDIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGNsYXNzIE15QmxvZ1BhcmFtMlYyIHtcbiAgbGFtYmRhID0ge1xuICAgIGZ1bmN0aW9uTmFtZTogXCJtZXRhbG1lbnRhbC1teWJsb2d2Mi1sYW1iZGEtY2hhdFwiLFxuICAgIGxvZ0dyb3VwTmFtZTogXCJtZXRhbG1lbnRhbC1teWJsb2d2Mi1sYW1iZGEtbG9ncy1jaGF0XCIsXG4gICAgcm9sZU5hbWU6IFwibWV0YWxtZW50YWwtbXlibG9ndjItbGFtYmRhLXJvbGUtY2hhdFwiLFxuICAgIGxheWVyTmFtZTogXCJtZXRhbG1lbnRhbC1teWJsb2d2Mi1sYW1iZGEtbGF5ZXItY2hhdFwiLFxuICAgIGZ1bmN0aW9uTmFtZTI6IFwibWV0YWxtZW50YWwtbXlibG9ndjItd2Vic29ja2V0LWxhbWJkYS1kYlwiLFxuICAgIGxvZ0dyb3VwTmFtZTI6IFwibWV0YWxtZW50YWwtbXlibG9ndjItd2Vic29ja2V0LWxhbWJkYS1sb2dzLWRiXCIsXG4gICAgZnVuY3Rpb25OYW1lMzogXCJtZXRhbG1lbnRhbC1teWJsb2d2Mi1zZXMtbGFtYmRhXCIsXG4gICAgbG9nR3JvdXBOYW1lMzogXCJtZXRhbG1lbnRhbC1teWJsb2d2Mi1zZXMtbG9nc1wiLFxuICB9O1xuICBhcGlHYXRld2F5ID0ge1xuICAgIGxvZ0dyb3VwTmFtZTogXCJtZXRhbG1lbnRhbC1teWJsb2d2Mi1hcGlndy1sb2dzXCIsXG4gICAgYXBpTmFtZTogXCJtZXRhbG1lbnRhbC1teWJsb2d2Mi1hcGlnd1wiLFxuICB9O1xuICBkeW5hbW9kYiA9IHtcbiAgICB0YWJsZU5hbWU6IFwibWV0YWxtZW50YWwtbXlibG9ndjItZGJcIixcbiAgICBwcmltYXJ5S2V5TmFtZTogXCJpZFwiLFxuICB9O1xufVxuIl19