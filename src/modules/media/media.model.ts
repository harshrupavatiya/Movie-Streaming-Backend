import mongoose, { Model, Schema } from 'mongoose';
import { IMedia } from './media.interface';
import { Crew } from '../crew';
import { Episode } from '../episode';

const mediaSchema = new Schema<IMedia>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxLength: 100,
    },
    description: {
      type: String,
      maxlength: 300,
    },
    genres: [
      {
        type: Number,
        required: true,
      },
    ],
    languages: [
      {
        type: String,
        required: true,
      },
    ],
    releaseDate: {
      type: Date,
      required: true,
    },
    rating: {
      type: Number,
      default: 9,
      min: 0,
      max: 10,
    },
    contentType: {
      type: String,
      enum: ['Movie', 'Series'],
    },
    likes: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review',
      },
    ],
    crew: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Crew',
      },
    ],
    poster: {
      type: String,
      required: true,
    },
    trailerUrl: {
      type: String,
      required: true,
    },
    movieUrl: {
      type: String,
    },
    availableForStreaming: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

mediaSchema.pre('findOneAndDelete', async function (next) {
  // delete all episodes which has given mediaId
  Episode.deleteMany({ mediaId: this.getQuery()._id })
    .then((val) => console.log('All Episode deleted successfully. ', val))
    .catch((err) => console.log('something qwent wrong while deleting episodes. ', err));

  next();
});

mediaSchema.post('save', async function () {
  if (this.crew && this.crew.length > 0) {
    Promise.all(
      this.crew.map((crewId) =>
        Crew.findByIdAndUpdate(crewId.toString(), {
          $addToSet: { media: this._id },
        })
      )
    );
  }
});

// Function to add a review properly
mediaSchema.statics.addReview = async function (mediaId, reviewId) {
  if (!mongoose.Types.ObjectId.isValid(mediaId) || !mongoose.Types.ObjectId.isValid(reviewId)) {
    throw new Error('Invalid mediaId or reviewId');
  }

  return this.findByIdAndUpdate(mediaId, {
    $push: { reviews: reviewId },
  }, { new: true });
};

const Media: Model<IMedia> = mongoose.model<IMedia>('Media', mediaSchema);

export default Media;
