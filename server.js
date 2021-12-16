const express = require("express")
const {graphqlHTTP} = require("express-graphql")

const {
    GraphQLSchema, GraphQLObjectType, GraphQLString 
} = require("graphql")

const app = express()




const schema = new GraphQLSchema({
    query: new GraphQLObjectType({
        name: "hello",
        fields: () => ({
            message: {
                type: GraphQLString,
                resolve: () => "hello world"
            }
        })
    })
})


app.use("/graphql", graphqlHTTP({
    graphiql: true,
    schema: schema
}));


app.listen(3000, ()=> console.log("server running on port 3000"))