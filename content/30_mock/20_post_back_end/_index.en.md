+++

title = "Post feature: Back-end (1)"
date = 2020-03-18T10:09:47+09:00

weight = 3

pre = "<b>3.3. </b>"

+++



Now that you have implemented the authentication function, let's create a GraphQL API to manage Post.


{{< figure src="/images/30_mock/architecture_api.png" title="GraphQL API" class="center" width=" 50% ">}}


### Creating GraphQL APIs
Execute `$amplify add api` in the terminal.

```sh
amplify add api
```

A few questions are asked to you, so please enter as follows:

```none
? Select from one of the below mentioned services: GraphQL
```

In the next questions, you can select items using arrow keys and modify it.

1. Set `Authorization modes` as `Amazon Cognito User Pool`
2. Type `No` for `? Configure additional auth types?`

Please confirm prompt is the same as following, and then please select `Continue`.

```none
? Here is the GraphQL API that we will create. Select a setting to edit or continue 
  Name: boyaki 
  Authorization modes: Amazon Cognito User Pool (default) 
  Conflict detection (required for DataStore): Disabled 
❯ Continue 
```

Answer the rest questions as below. Then you'll find GraphQL schema file opend in your editor.

```none
? Choose a schema template: Single object with fields (e.g., “Todo” with ID, name, description)
✔ Do you want to edit the schema now? (Y/n) · Y
```

{{% notice tip%}}
When choosing GraphQL, it provisions AWS AppSync, which is a managed service for GraphQL. AWS AppSync provides four authentication options: IAM authentication, API KEY authentication, Amazon Cognito User Pool authentication, and OIDC authentication.
You can use one or more of those authentications at the same time.
When choosing REST, it provisions Amazon API Gateway+AWS Lambda+Amazon DynamoDB [[learn more]](https://docs.amplify.aws/cli/restapi).
{{% /notice%}}


### Creating a Post Type
You can freely control the behavior of GraphQL API by editing `./amplify/backend/api/BoyakiGql/schema.graphql`.
Let's edit schema.graphql to create an API to manage posts.

Copy the following contents and replace `./amplify/backend/api/BoyakiGql/schema.graphql` with it.

```graphql
type Post
  @model (
    mutations: {create: "createPost", delete: "deletePost", update: null}
  )
  @auth(rules: [
    {allow: owner, ownerField:"owner", provider: userPools, operations:[read, create, delete]}
    {allow: private, provider: userPools, operations:[read]}
  ])
{
  id: ID! @primaryKey # automatically filled by AppSync
  type: String! # always set to 'post'. used in the SortByTimestamp GSI
  content: String!
  owner: String
  timestamp: Int!
}
```

- With `@model` (model directive), Amazon DynamoDB Table according to the definition of Post type and Query/Mutation for CRUD/Subscription are created automatically. [[learn more](https://docs.amplify.aws/cli/graphql/data-modeling/)]
  -  GraphQL API doesn't have API for updating Post by specifing `mutations: ...` because user doesn't need to update Post in this app. [detail](https://docs.amplify.aws/cli/graphql/data-modeling/#rename-generated-queries-mutations-and-subscriptions) 
- `@auth` (auth directive) can be used to implement Query/Mutation authorization strategy for Post type. [[learn more](https://docs.amplify.aws/cli/graphql/authorization-rules/)]
  - `{allow: owner,... ` allows `read`, `create` and `delete` for the author of Post (owner).
  - `{allow: private,... ` allows `read` for all users authenticated with Cognito User Pools.
- Specify `id` field as primaryKey using `@primaryKey`
  - This `id` field is automatically filled by Amplify in UUID format when creating Post.
- The `type` field is used later. It always contains `"post"`.
- `content` is a field of type `String`. `!` means it's a required field.

{{% notice tip%}}
GraphQL provides scalar types such as `ID`, `String`, and `Int`. In addition to these, AWS AppSync provides unique scalar types such as `AWSTimestamp`, `AWSURL`, and `AWSPhone`. [[learn more](https://docs.aws.amazon.com/ja_jp/appsync/latest/devguide/scalars.html)]
{{% /notice%}}

### Amplify Mocking


{{% notice info%}}
Amplify Mocking requires port 20002 to be available and may not be available in all Cloud IDEs.
If you are using the applicable Cloud IDE, please do not follow this procedure and enjoy the atmosphere.
{{% /notice%}}


`$amplify push` refers to and modifies the stack in AWS CloudFormation, which  takes some time.
The `$ amplify mock` command allows you to check the behavior of the changes in the local environment before applying the changes to the cloud resource with `$ amplify push`.
Let's use Amplify Mocking once to see how the schema behaves.


```bash
amplify mock api
```


A few questions are asked to you, so please answer them as follows. **Note that the last question, `Enter maximum statement depth` should be answered as `3`**.


- Choose the code creation language target `javascript`
- Enter the file name pattern of graphql queries, mutations and subscriptions `src/graphql /**/*.js`
- Do you want to generate/update all possible GraphQL operations - queries, mutations and subscriptions `Yes`
- Enter maximum statement depth [increase from default if your schema is deep nested] `3 `


{{% notice tip%}}
Here sets the configuration of `codegen` command for Query/Mutation/Subscription in GraphQL.
`maximum statement depth` sets how far the nested structure of `type` in schema.graphql is scanned.
If you want to change the settings, you can do the same with the `$ amplify update codegen` command.
{{% /notice%}}

When Amplify Mocking starts, it shows `AppSync Mock endpoint is running at http://XXX.XXX.XXX.XXX:20002`. Please access `http://XXX.XXX.XXX.XXX:20002` with your browser. (The IP address portion of XXX varies depending on your environment. If you use container for einvrionment, please access `localhost:20002` instead.)

![](/images/30_mock/graphql_1.png)

#### createPost
First, let's create a Post.

1. In the lower left corner, click `ADD NEW Query`, choose `Mutation`, and then click `+`.
1. Click `createPost` in the left pane and fill in the checkboxes and fields as shown in the following figure.
1. Click **▶** to run GraphQL Mutation.
1. The results are displayed in the right pane. Make sure that id or owner is automatically given though not passed to input.
1. In order to validate `listPosts` later, let's add a few Posts with different `timestamp` appropriately.

{{% notice tip%}}
If you want to get the Unix Timestamp for the current time, execute `$date +%s` in the terminal.
{{% /notice%}}

![](/images/30_mock/graphql_2.png)

#### listPosts
Next, let's get the list of created Post.

1. In the lower left corner, click on the text `ADD NEW Mutation`, choose `Query`, and then click `+`.
1. Click `listPosts` in the left pane and fill in the checkboxes and fields as shown in the following figure.
1. Click **▶** ︎ to execute a GraphQL Query.
1. The results are displayed in the right pane. Make sure that the Post you just created is displayed.
1. Also, make sure that the order in which they appear is not the order in which they were created.
1. Stop Amplify Mocking by executing `CTRL+C` in the terminal where `$amplify mock api` is running.

![](/images/30_mock/listPosts.png)