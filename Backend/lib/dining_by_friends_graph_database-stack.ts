import * as cdk from '@aws-cdk/core';
import * as lambda from "@aws-cdk/aws-lambda";
import * as appsync from "@aws-cdk/aws-appsync";
import * as events from "@aws-cdk/aws-events";
import * as targets from "@aws-cdk/aws-events-targets";
import { requestTemplate, responseTemplate } from '../utils/appsync-request-response';
import * as neptune from "@aws-cdk/aws-neptune";
import * as ec2 from "@aws-cdk/aws-ec2";


export class DiningByFriendsGraphDatabaseStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here


    const vpc = new ec2.Vpc(this, "Vpc");

    const neptuneCluster = new neptune.DatabaseCluster(this, "NeptuneDatabaseCluster", {
      vpc,
      instanceType: neptune.InstanceType.T3_MEDIUM,
      dbClusterName: "myDbCluster",

    });

    neptuneCluster.connections.allowDefaultPortFromAnyIpv4("Open to the world");

    const writeAddress = neptuneCluster.clusterEndpoint.socketAddress;
    const readAddress = neptuneCluster.clusterReadEndpoint.socketAddress;


    const api = new appsync.GraphqlApi(this, "DiningByFriendsEvents", {
      name: "Dining-by-Friends-Events",
      schema: appsync.Schema.fromAsset("graphql/schema.gql"),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.API_KEY,
          apiKeyConfig: {
            expires: cdk.Expiration.after(cdk.Duration.days(365)),
          },
        },
      },
    });

    // creating an HTTP Datasource which will do a post request to our event bridge endpoint
    const httpDs = api.addHttpDataSource(
      "ds",
      "https://events." + this.region + ".amazonaws.com", // add an http endpoint to our api which in our case in our eventbidge endpoint
      {
        name: "httpsDsWithEventBridge",
        description: "From Appsync to EventBridge",
        authorizationConfig: {
          signingRegion: this.region,
          signingServiceName: "events",
        },
      });


    const getDataLambda = new lambda.Function(this, "Lambda_GetData", {
      vpc,
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.Code.fromAsset("lambda/lambda2"),
      handler: "main.handler",
      memorySize: 1024,
      timeout: cdk.Duration.minutes(2)

    });

    getDataLambda.addEnvironment("WRITER_ENDPOINT", writeAddress);
    getDataLambda.addEnvironment("READER_ENDPOINT", readAddress);



    const lambda_data_source = api.addLambdaDataSource("lambdaDataSource", getDataLambda);

    lambda_data_source.createResolver({
      typeName: "Query",
      fieldName: "getPerson",
    });


    lambda_data_source.createResolver({
      typeName: "Query",
      fieldName: "getFriends"
    })


    lambda_data_source.createResolver({
      typeName: "Query",
      fieldName: "getFriendsOfFriend"
    });


    lambda_data_source.createResolver({
      typeName: "Query",
      fieldName: "getHighestRatedByCuisine"
    });

    lambda_data_source.createResolver({
      typeName: "Query",
      fieldName: "getHighestByRating"
    });

    lambda_data_source.createResolver({
      typeName: "Query",
      fieldName: "getNewReviews"
    });

    lambda_data_source.createResolver({
      typeName: "Query",
      fieldName: "getFriendsRecommendedRestaurants"
    });

    lambda_data_source.createResolver({
      typeName: "Query",
      fieldName: "getFriendsRecommendedRestaurantsBasedOnReviewRating"
    });


    const mutations = ["addPerson", "deleteVertices", "addFriend", "addFriendOfFriend", "addReview", "addRestaurant", "addCity", "addState", "addReviewOfReviews", "clearGraph"]
    mutations.forEach((mut) => {

      if (mut === "addPerson") {
        let details = `\\\"name\\\" : \\\"$ctx.arguments.name\\\" , \\\"city\\\" : \\\"$ctx.arguments.city\\\"`
        httpDs.createResolver({
          typeName: "Mutation",
          fieldName: mut,
          requestMappingTemplate: appsync.MappingTemplate.fromString(requestTemplate(details, mut)),
          responseMappingTemplate: appsync.MappingTemplate.fromString(responseTemplate()),
        });
      }

      else if (mut === "deleteVertices") {
        let details = `\\\"label\\\" : \\\"$ctx.arguments.label\\\"`
        httpDs.createResolver({
          fieldName: mut,
          typeName: "Mutation",
          requestMappingTemplate: appsync.MappingTemplate.fromString(requestTemplate(details, mut)),
          responseMappingTemplate: appsync.MappingTemplate.fromString(responseTemplate()),
        });
      }

      else if (mut === "clearGraph") {
        let details = `\\\"key\\\" : \\\"$ctx.arguments.key\\\"`
        httpDs.createResolver({
          fieldName: mut,
          typeName: "Mutation",
          requestMappingTemplate: appsync.MappingTemplate.fromString(requestTemplate(details, mut)),
          responseMappingTemplate: appsync.MappingTemplate.fromString(responseTemplate()),
        })

      }

      else if (mut === "addFriend") {
        let details = `\\\"name\\\" : \\\"$ctx.arguments.name\\\" , \\\"city\\\" : \\\"$ctx.arguments.city\\\"`
        httpDs.createResolver({
          fieldName: mut,
          typeName: "Mutation",
          requestMappingTemplate: appsync.MappingTemplate.fromString(requestTemplate(details, mut)),
          responseMappingTemplate: appsync.MappingTemplate.fromString(responseTemplate()),
        });
      }

      else if (mut === "addFriendOfFriend") {
        let details = `\\\"name\\\" : \\\"$ctx.arguments.name\\\" , \\\"friendName\\\" : \\\"$ctx.arguments.friendName\\\"`
        httpDs.createResolver({
          fieldName: mut,
          typeName: "Mutation",
          requestMappingTemplate: appsync.MappingTemplate.fromString(requestTemplate(details, mut)),
          responseMappingTemplate: appsync.MappingTemplate.fromString(responseTemplate()),
        });
      }

      else if (mut === "addReview") {
        let details = `\\\"rating\\\" : \\\"$ctx.arguments.rating\\\" , \\\"body\\\" : \\\"$ctx.arguments.body\\\" , \\\"nameOfCustomer\\\" : \\\"$ctx.arguments.nameOfCustomer\\\",\\\"restaurant_name\\\" : \\\"$ctx.arguments.restaurant_name\\\"`
        httpDs.createResolver({
          fieldName: mut,
          typeName: "Mutation",
          requestMappingTemplate: appsync.MappingTemplate.fromString(requestTemplate(details, mut)),
          responseMappingTemplate: appsync.MappingTemplate.fromString(responseTemplate()),
        });
      }

      else if (mut === "addRestaurant") {
        let details = `\\\"name\\\" : \\\"$ctx.arguments.name\\\" , \\\"cuisine\\\" : \\\"$ctx.arguments.cuisine\\\"`
        httpDs.createResolver({
          fieldName: mut,
          typeName: "Mutation",
          requestMappingTemplate: appsync.MappingTemplate.fromString(requestTemplate(details, mut)),
          responseMappingTemplate: appsync.MappingTemplate.fromString(responseTemplate()),
        })
      }

      else if (mut === "addCity") {
        let details = `\\\"name\\\" : \\\"$ctx.arguments.name\\\"`
        httpDs.createResolver({
          fieldName: mut,
          typeName: "Mutation",
          requestMappingTemplate: appsync.MappingTemplate.fromString(requestTemplate(details, mut)),
          responseMappingTemplate: appsync.MappingTemplate.fromString(responseTemplate()),
        })
      }

      else if (mut === "addState") {
        let details = `\\\"name\\\" : \\\"$ctx.arguments.name\\\"`
        httpDs.createResolver({
          fieldName: mut,
          typeName: "Mutation",
          requestMappingTemplate: appsync.MappingTemplate.fromString(requestTemplate(details, mut)),
          responseMappingTemplate: appsync.MappingTemplate.fromString(responseTemplate()),
        })
      }

      else if (mut === "addReviewOfReviews") {
        let details = `\\\"name\\\" : \\\"$ctx.arguments.name\\\" , \\\"rating\\\" : \\\"$ctx.arguments.rating\\\" , \\\"review_id\\\" : \\\"$ctx.arguments.review_id\\\"`
        httpDs.createResolver({
          fieldName: mut,
          typeName: "Mutation",
          requestMappingTemplate: appsync.MappingTemplate.fromString(requestTemplate(details, mut)),
          responseMappingTemplate: appsync.MappingTemplate.fromString(responseTemplate()),
        })
      }

    });


    // now grant permission to httpsDs to put events inside the eventBus
    events.EventBus.grantAllPutEvents(httpDs);


    const neptuneLambdaFn = new lambda.Function(this, "Lambda_NeptuneHandler", {
      vpc,
      functionName: "Lambda_Neptune_Handler",
      runtime: lambda.Runtime.NODEJS_10_X,
      code: lambda.Code.fromAsset("lambda/lambda1"),
      handler: "neptuneHandler.handler",
      memorySize: 1024,
      timeout: cdk.Duration.minutes(2)
    });

    neptuneLambdaFn.addEnvironment("WRITER_ENDPOINT", writeAddress)
    neptuneLambdaFn.addEnvironment("READER_ENDPOINT", readAddress)

    //  writeAddress
    new cdk.CfnOutput(this, "writeAddress", {
      value: writeAddress,
    });

    new cdk.CfnOutput(this, "readAddress", {
      value: readAddress,
    });




    // Rule which will be used by the eventBus to check what 
    //is the source of the arriving event and if the source is matched
    //then the consumer will be targeted

    const rule = new events.Rule(this, "AppSync_DiningByFriends_Events", {
      ruleName: "AppSync_DiningByFriends_Events",
      eventPattern: {
        source: ["DiningByFriends_15A"],
        detailType: [...mutations],
      }
    });
    rule.addTarget(new targets.LambdaFunction(neptuneLambdaFn));


  }
}
