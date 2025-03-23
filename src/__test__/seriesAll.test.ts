import Series from "../models/series";
import request from "supertest";
import app from "../index";

// Integration test: coverse all functionality which is connected to api
describe("GET /series/genre/:genre (Integration Test)", () => {
  const cookie =
    "token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2N2QyODg0YTAwYjlmMGZiYWQyYWRhMGQiLCJpYXQiOjE3NDI3Mzg3MDAsImV4cCI6MTc0MzM0MzUwMH0.4k7WpL01Rb6VNDJLRqry05uEIZB-vT3B2V3vY029ekY";

  // Incase of user not logged in
  it("should return 400 if the user is not logged in", async () => {
    const response = await request(app).get("/series/genre/80");

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Please Login");
  });

  //   Incase of given token is Invalid
  it("should return 400 if the token is invalid", async () => {
    const response = await request(app)
      .get("/series/genre/80")
      .set("Cookie", cookie + "wef");

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("invalid signature");
  });

  // Incase of genreId is invalid
  it("should return 400 for an invalid genre ID", async () => {
    const response = await request(app)
      .get("/series/genre/invalid")
      .set("Cookie", cookie);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      "Genre ID must be a positive integer (≥1)"
    );
  });

  //   Incase of every input is properly provided
  it("should return a list of series for a valid genre", async () => {
    const response = await request(app)
      .get("/series/genre/80?skip=0&limit=2")
      .set("Cookie", cookie);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("list of series");
    expect(response.body.data.seriesList).toHaveLength(2);
  });

  //   Incase of there is no series with give genreId
  it("should return 200 with an empty list if no series exist for the genre", async () => {
    const response = await request(app)
      .get("/series/genre/999?skip=0&limit=10")
      .set("Cookie", cookie);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe(
      "no series available with given genreId"
    );
    expect(response.body.data).toBeUndefined();
  });
});

// Before running this test case, mongoURi needs to change as testdb
// Because : this all testcase should run on additional testInputs
describe("GET /series/genre/:genre (Relation Test)", () => {
  const cookie =
    "token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2N2QyODg0YTAwYjlmMGZiYWQyYWRhMGQiLCJpYXQiOjE3NDI3Mzg3MDAsImV4cCI6MTc0MzM0MzUwMH0.4k7WpL01Rb6VNDJLRqry05uEIZB-vT3B2V3vY029ekY";

  // Incase of user not logged in
  it("should return 400 if the user is not logged in", async () => {
    const response = await request(app).get("/series/genre/80");

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Please Login");
  });

  //   Incase of given token is Invalid
  it("should return 400 if the token is invalid", async () => {
    const response = await request(app)
      .get("/series/genre/80")
      .set("Cookie", cookie + "wef");

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("invalid signature");
  });

  // Incase of genreId is invalid
  it("should return 400 for an invalid genre ID", async () => {
    const response = await request(app)
      .get("/series/genre/invalid")
      .set("Cookie", cookie);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      "Genre ID must be a positive integer (≥1)"
    );
  });

  //   Incase of every input is properly provided
  it("should return a list of series for a valid genre", async () => {
    const response = await request(app)
      .get("/series/genre/80?skip=0&limit=2")
      .set("Cookie", cookie);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("list of series");
    expect(response.body.data.seriesList).toHaveLength(2);
  });

  //   Incase of there is no series with give genreId
  it("should return 200 with an empty list if no series exist for the genre", async () => {
    const response = await request(app)
      .get("/series/genre/999?skip=0&limit=10")
      .set("Cookie", cookie);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe(
      "no series available with given genreId"
    );
    expect(response.body.data).toBeUndefined();
  });
});

// Branch testCases: it coverse All possible ways of output
describe("GET /series/genre/:genre (Branch Test)", () => {
  const cookie =
    "token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2N2QyODg0YTAwYjlmMGZiYWQyYWRhMGQiLCJpYXQiOjE3NDI3Mzg3MDAsImV4cCI6MTc0MzM0MzUwMH0.4k7WpL01Rb6VNDJLRqry05uEIZB-vT3B2V3vY029ekY";

  // Incase of user not logged in
  it("should return 400 if the user is not logged in", async () => {
    const response = await request(app).get("/series/genre/80");

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Please Login");
  });

  //   Incase of given token is Invalid
  it("should return 400 if the token is invalid", async () => {
    const response = await request(app)
      .get("/series/genre/80")
      .set("Cookie", cookie + "wef");

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("invalid signature");
  });

  // Incase of genreId is invalid
  it("should return 400 for an invalid genre ID", async () => {
    const response = await request(app)
      .get("/series/genre/invalid")
      .set("Cookie", cookie);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      "Genre ID must be a positive integer (≥1)"
    );
  });

  //   Incase of every input is properly provided
  it("should return a list of series for a valid genre", async () => {
    const response = await request(app)
      .get("/series/genre/80?skip=0&limit=2")
      .set("Cookie", cookie);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("list of series");
    expect(response.body.data.seriesList).toHaveLength(2);
  });

  //   Incase of there is no series with give genreId
  it("should return 200 with an empty list if no series exist for the genre", async () => {
    const response = await request(app)
      .get("/series/genre/999?skip=0&limit=10")
      .set("Cookie", cookie);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe(
      "no series available with given genreId"
    );
    expect(response.body.data).toBeUndefined();
  });

  // Incase of any DB error occured
  it("should return 500 if an internal server error occurs", async () => {
    jest
      .spyOn(Series, "aggregate")
      .mockRejectedValueOnce(new Error("DB error"));

    const response = await request(app)
      .get("/series/genre/1?skip=0&limit=10")
      .set("Cookie", cookie);

    expect(response.status).toBe(500);
    expect(response.body.message).toBe("DB error");

    jest.restoreAllMocks();
  });
});
