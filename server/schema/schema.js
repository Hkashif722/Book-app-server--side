const graphql = require("graphql");
const _ = require("lodash");
const Book = require("../modal/book");
const Author = require("../modal/author");
const mongoose = require("mongoose");
require("dotenv").config();

const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLSchema,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
} = graphql;
mongoose.connect(
  `mongodb+srv://${process.env.USER_NAME}:${process.env.PASSWORD}@cluster0.q38bu.mongodb.net/graphqlDB`,
  { useNewUrlParser: true, useUnifiedTopology: true }
);
mongoose.connection.once("open", () => {
  console.log("connected to database");
});
// Test Data
// var books = [
//   { name: "Name of the Wind", genre: "Fantasy", id: "1", authorid: "1" },
//   { name: "The Final Empire", genre: "Fantasy", id: "2", authorid: "2" },
//   { name: "The Long Earth", genre: "Sci-Fi", id: "3", authorid: "3" },
//   { name: "The Heroes of Ages", genre: "Fantasy", id: "4", authorid: "2" },
//   { name: "The Color Of Magic", genre: "Fantasy", id: "5", authorid: "3" },
//   { name: "The Light Fantastic", genre: "Fantasy", id: "6", authorid: "3" },
// ];
// var authors = [
//   { name: "Patrik Rothfuss", age: 44, id: "1" },
//   { name: "Brandon Sanderson", age: 42, id: "2" },
//   { name: "Terry Pratchett", age: 66, id: "3" },
// ];

const BookType = new GraphQLObjectType({
  name: "Book",
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    genre: { type: GraphQLString },
    authorid: { type: GraphQLID },
    author: {
      type: AuthorType,
      resolve(parent, args) {
        // return _.find(authors, { id: parent.authorid });
        return Author.findById(parent.authorid);
      },
    },
  }),
});
const AuthorType = new GraphQLObjectType({
  name: "Author",
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    age: { type: GraphQLInt },
    books: {
      type: new GraphQLList(BookType),
      resolve(parent, args) {
        return Book.find({ authorid: parent.id });
      },
    },
  }),
});

const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    book: {
      type: BookType,
      args: { id: { type: GraphQLID } },
      resolve(parent, args) {
        //code to get data from db/ other source
        //return _.find(books, { id: args.id });
        return Book.findById(args.id);
      },
    },
    author: {
      type: AuthorType,
      args: { id: { type: GraphQLID } },
      resolve(parent, args) {
        // return _.find(authors, { id: args.id });
        return Author.findById(args.id);
      },
    },
    books: {
      type: new GraphQLList(BookType),
      resolve(parent, args) {
        // return books;
        return Book.find({});
      },
    },
    authors: {
      type: new GraphQLList(AuthorType),
      resolve(parent, args) {
        // return authors;
        return Author.find({});
      },
    },
  },
});

const Mutation = new GraphQLObjectType({
  name: "mutation",
  fields: {
    addauthor: {
      type: AuthorType,
      args: {
        name: { type: new GraphQLNonNull(GraphQLString) },
        age: { type: new GraphQLNonNull(GraphQLInt) },
      },
      resolve(parent, args) {
        let author = new Author({
          name: args.name,
          age: args.age,
        });
        return author.save();
      },
    },
    addbook: {
      type: BookType,
      args: {
        name: { type: new GraphQLNonNull(GraphQLString) },
        genre: { type: new GraphQLNonNull(GraphQLString) },
        authorid: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve(parent, args) {
        let book = new Book({
          name: args.name,
          genre: args.genre,
          authorid: args.authorid,
        });
        return book.save();
      },
    },
  },
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation,
});
