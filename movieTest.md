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

- AddMovie - /createMovie - POST
  -- body -> title 1*, description 1,genres [2]* , duration 2*, rating 2* , casts [3]_ , directors [3]_ , languages [1]_ , availableForStreaming [1] , poster 4_ , trailer 5*, movie 5*

- GetMovie - /getMovieById/:movieId - GET
  -- give movieId(ObjectId)\* at last instead of :movieId

- UpdateMovie - /updateMovieById - PUT
  -- body -> movieId 1\* , field you want to update

- DeleteMovie - /deleteMovieById - DELETE
  -- in params

- GetMoviesByGenres - /getMoviesByGenre/:genre - GET
  -- give genreId(in number)\* at last instead of :genre

- ViewIncrementer(For Views Calculation) - /viewIncrement/:movieId - POST
  -- give movieId(ObjectId)\* at last instead of :movieId

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
  -- For Add -- body -> name 1* , gender 1 , profilePicture 4(if not added, default will be added) , dateOfBirth (in string, YYYY-MM-DD) , nationality 1
  -- For Update -- body -> castId (ObjectId in string)* , any field you want to update

- SearchName - /getCastName - GET
  -- send name of cast by **query** field name in params

- Delete - /deleteCast/:castId - DELETE
  -- you have to send castId(ObjectId) instead of :castId

## /director (Only for admin)

- AddOrUpdate - /addOrUpdate - POST
  -- For Add -- body -> name 1\*, gender 1, dateOfBirth (in string, YYYY-MM-DD) ,nationality 1 , profilePicture 4(if not added, default will be added)

-- For Update -- body -> directorId(ObjectId in string)\* , any field you want to update

- SearchName - /getDirectorNames - GET
  -- send name of director by **name** field name in params

- Delete - //delete/:directorId - DELETE
  -- you have to send directorId(ObjectId) instead of :directorId

## /search (For Users) (Movie/Series/Cast/Director)

- Search - / - GET(Gives List of Movies and Series)
  -- send search query by **search** field name in params
