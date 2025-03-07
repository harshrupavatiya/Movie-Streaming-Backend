# APIs
1 - string
2 - number
3 - ObjectId
4 - img file
5 - video file
[1] - string[]
[2] - number[]
[3] - ObjectId[]

**NOTE**: When your Add/Update APIs contain file then write body in form-data

## /movie

-  AddMovie - /createMovie - POST
--  body -> title 1*, description 1,genres [2]* , duration 2*, rating 2* , casts [3]* , directors [3]* , languages [1]* , availableForStreaming [1] , poster 4* , trailer 5*, movie 5*

- GetMovie - /getMovieById/:movieId - GET
-- give movieId(ObjectId)* at last instead of :movieId

- UpdateMovie - /updateMovieById - PUT
-- body -> movieId 1* , field you want to update

- DeleteMovie - /deleteMovieById - DELETE
-- in params

- GetMoviesByGenres - /getMoviesByGenre/:genre - GET
-- give genreId(in number)* at last instead of :genre

- ViewIncrementer(For Views Calculation) - /viewIncrement/:movieId - POST
-- give movieId(ObjectId)* at last instead of :movieId

- GetMostViewedList - /getMostViewedMoviesList - GET
-- pagination is there ,also takes page and limit(optional)

- GetMostLikedList - /getMostLikedMoviesList - GET
-- pagination is there ,also takes page and limit(optional)

- SearchMovie(for admin) - /searchMovie - GET
-- in params send fieldname **query** and name you want to search (with pagination)

- GetTopRated - /getTopRatedMovies - GET
-- pagination is there ,also takes page and limit(optional)

- GetLatestReleases - /getLatestMovies - GET
-- pagination is there ,also takes page and limit(optional)

-GetPopular - /getPopularMovies - GET
-- pagination is there ,also takes page and limit(optional)


## /cast (Only For Admin)

- AddOrUpdate - /addOrUpdateCast -POST
-- For Add -- body -> name 1* , gender 1 , prrofilePicture 4(if not added, default will be added) , dateOfBirth (in string, YYYY-MM-DD) , nationality 1
-- For Update -- body -> castId (ObjectId in string)* , any field you want to update 

- SearchName - /getCastName - POST
  