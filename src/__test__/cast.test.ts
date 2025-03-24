import { searchCastByName } from "../controllers/cast";
import Cast from "../models/cast";

jest.mock("../models/cast");
describe("Cast Controller Tests", () => {
  let mockRequest: any;
  let mockResponse: any;

  beforeEach(() => {
    mockRequest = {
      query: {
        query: "St",
      },
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  it("should return 400 if query parameter is missing", async () => {
    mockRequest.query = { query: "" };

    await searchCastByName(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Query parameter is required.",
    });
  });

  it("should return 400 if query parameter is not a string", async () => {
    mockRequest.query = { query: 123 };

    await searchCastByName(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Query parameter is required.",
    });
  });

  it("should return 200 with a message if no matching cast members are found", async () => {
    mockRequest.query = { query: "xyz" }; 

    (Cast.find as jest.Mock).mockResolvedValue([]);

    await searchCastByName(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "No matching cast members found.",
    });
  });

  it("should return 200 with cast list if matching cast members are found", async () => {
    (Cast.find as jest.Mock).mockResolvedValue([
      {
        name: "St",
        _id: "123",
      },
    ]);

    await searchCastByName(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Cast list matching the search query",
      data: { castList: [{ name: "St", _id: "123" }] },
    });
  });
});
