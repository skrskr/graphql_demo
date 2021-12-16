const express = require("express")
const {graphqlHTTP} = require("express-graphql")

const {
    GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLList, GraphQLNonNull, GraphQLInt 
} = require("graphql")

const app = express()

const authors = [
	{ id: 1, name: 'J. K. Rowling' },
	{ id: 2, name: 'J. R. R. Tolkien' },
	{ id: 3, name: 'Brent Weeks' }
]

const books = [
	{ id: 1, name: 'Harry Potter and the Chamber of Secrets', authorId: 1 },
	{ id: 2, name: 'Harry Potter and the Prisoner of Azkaban', authorId: 1 },
	{ id: 3, name: 'Harry Potter and the Goblet of Fire', authorId: 1 },
	{ id: 4, name: 'The Fellowship of the Ring', authorId: 2 },
	{ id: 5, name: 'The Two Towers', authorId: 2 },
	{ id: 6, name: 'The Return of the King', authorId: 2 },
	{ id: 7, name: 'The Way of Shadows', authorId: 3 },
	{ id: 8, name: 'Beyond the Shadows', authorId: 3 }
]

const BookType = new GraphQLObjectType({
    name: "Book",
    description: "This represent a book",
    fields: () => ({
        id: {type: new GraphQLNonNull(GraphQLInt)},
        name: {type: new GraphQLNonNull(GraphQLString)},
        authorId: {type: new GraphQLNonNull(GraphQLInt)},
        author: {
            type: AuthorType,
            resolve: (book) => {
                return authors.find(author => author.id === book.authorId)
            }
        }
    })
})

const AuthorType = new GraphQLObjectType({
    name: "Author",
    description: "this represnets a author",
    fields: () => ({
        id: {type: new GraphQLNonNull(GraphQLInt)},
        name: {type: new GraphQLNonNull(GraphQLString)},
        books: {
            type: new GraphQLList(BookType),
            resolve: (author) => {
                return books.filter(book => book.authorId === author.id)
            }
        }
    })
})

const RootQuery = new GraphQLObjectType({
    name: "Query",
    description: "Root Query",
    fields: () => ({
        book: {
            type: BookType,
            description: "single book details",
            args: {
                id: {type: GraphQLInt}
            },
            resolve: (parent, args) => {
                return books.find(book => book.id === args.id)
            }
        },
        books: {
            type: new GraphQLList(BookType),
            description: "List of all books",
            resolve: () => books
        },
        author: {
            type: AuthorType,
            description: "A single author detials",
            args: {
                id: {type: GraphQLInt}
            },
            resolve: (parent, args) => {
                return authors.find(author => author.id === args.id)
            } 
        },
        authors: {
            type: new GraphQLList(AuthorType),
            description: "List of all authors",
            resolve: () => authors
        }
    })
})

const RootMutation = new GraphQLObjectType({
    name: "Mutation",
    description: "Mutation Query",
    fields: () => ({
        addBook: {
            type: BookType,
            description: "Added new book",
            args: {
                name: {type: new GraphQLNonNull(GraphQLString)},
                authorId: {type: new GraphQLNonNull(GraphQLInt)}
            },
            resolve: (parent, args) => {
                const book = {id: books.length + 1, name: args.name, authorId: args.authorId}
                books.push(book)
                return book
            }
        },
        editBook: {
            type: BookType,
            description: "edit book details by id",
            args: {
                id: {type: new GraphQLNonNull(GraphQLInt)},
                name: {type: new GraphQLNonNull(GraphQLString)},
                authorId: {type: new GraphQLNonNull(GraphQLInt)}
            },
            resolve: (parent, args) => {
                const bookIndex = books.findIndex((book => book.id == args.id));
                if (bookIndex < 0) {
                    return null
                }
                books[bookIndex].name = args.name
                books[bookIndex].authorId = args.authorId
                return books[bookIndex]
            }
        },
        deleteBook: {
            type: new GraphQLList(BookType),
            description: "delete book by id",
            args: {
                id: {type: new GraphQLNonNull(GraphQLInt)}
            },
            resolve: (parent, args) => {
                const bookIndex = books.findIndex((book => book.id == args.id));
                if (bookIndex < 0) 
                    return []

                books.splice(bookIndex, 1)
                return books
            }
        },
        addAuthor: {
            type: AuthorType,
            description: "add an author",
            args: {
                name: {type: new GraphQLNonNull(GraphQLString)}
            },
            resolve: (parent, args) => {
                const author = {id: authors.length + 1, name: args.name}
                authors.push(author)
                return author
            }
        },
        editAuthor: {
            type: AuthorType,
            description: "edit autor details by id",
            args: {
                id: {type: new GraphQLNonNull(GraphQLInt)},
                name: {type: new GraphQLNonNull(GraphQLString)}
            },
            resolve: (parent, args) => {
                const authorIndex = authors.findIndex((author => author.id == args.id));
                if (authorIndex < 0) {
                    return null
                }
                authors[authorIndex].name = args.name
                return authors[authorIndex]
            }
        },
        deleteAuthor: {
            type: new GraphQLList(AuthorType),
            description: "delete autor by id",
            args: {
                id: {type: new GraphQLNonNull(GraphQLInt)}
            },
            resolve: (parent, args) => {
                const authorIndex = authors.findIndex((author => author.id == args.id));
                if (authorIndex < 0) 
                    return []

                authors.splice(authorIndex, 1)
                return authors
            }
        }
    })
})



const schema = new GraphQLSchema({
    query: RootQuery,
    mutation: RootMutation
})

app.use("/graphql", graphqlHTTP({
    graphiql: true,
    schema: schema
}));


app.listen(3000, ()=> console.log("server running on port 3000"))