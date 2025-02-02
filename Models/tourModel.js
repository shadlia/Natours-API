const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
const User = require('./userModel');
const TourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: [true, 'already exist with same name'],
      trim: true,
      maxlength: [40, 'A tour name must be at less or equal to 40 characters'],
      minlength: [10, 'A tour name must be at less or equal to 10 characters'],
      //validate:[validator.isAlpha,"A tour must only contain alpha characters"]
    },
    slug: {
      type: String,
    },
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a diffucilty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either easy medium or difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'A tour must have a Rating above 1.0'],
      max: [5, 'A tour must have a Rating below 5.0'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) must be lower than regular price ',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a summary'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    // embeded documents : arrays of objects
    startLocation: {
      // GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordoniates: [Number], //array of numbers
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordoniates: [Number], //array of numbers
        address: String,
        description: String,
        day: Number,
      },
    ],
    // [] means sub documents
    // reference to the id of the user (guide of the tour)
    guides: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);
//virtual properties
TourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});
//Doc middlewares : runs before .save and .create
TourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});
//embeddin data : get the full infos of the guides through ids (new docs only )
/* TourSchema.pre('save', async function (next) {
  const guidesPromises = this.guides.map(async (id) => await User.findById(id)); // its an array full of promises
  this.guides = await Promise.all(guidesPromises); //save the result of the promises
  next();
}); */

TourSchema.post('save', function (doc, next) {
  console.log(doc);
  next();
});
//QUERY MIDDLEWARE
//TourSchema.pre('find', function (next)
TourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } }); //only non secretTour will be shown
  this.start = Date.now();
  next();
});
TourSchema.pre('findOneAndUpdate', function (next) {
  this.options.runValidators = true;
  next();
});
TourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  }); // we use populate to get the guides inforrmation cause we used reference instead of embedded
  next();
});
TourSchema.post(/^find/, function (docs, next) {
  //console.log(docs);
  console.log(`Query took ${Date.now() - this.start} ms`);
  next();
});
//AGGREGATION MIDDLEWARE
TourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } }); // add at the beginning of the array
  next();
});
const Tour = mongoose.model('Tour', TourSchema); // capital T

module.exports = Tour;
