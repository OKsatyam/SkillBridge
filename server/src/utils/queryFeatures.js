export class QueryFeatures {
  constructor(query, queryString) {
    this.query = query;             // a Mongoose Query object, e.g. Gig.find()
    this.queryString = queryString; // req.query — the raw URL query params
  }

  search() {
    if (this.queryString.keyword) {
      this.query = this.query.find({ $text: { $search: this.queryString.keyword } });
    }
    return this;
  }

  filter() {
    const excludedFields = ['keyword', 'page', 'limit', 'sort'];
    const queryObj = { ...this.queryString };
    excludedFields.forEach((field) => delete queryObj[field]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  sort() {
    const sortBy = this.queryString.sort ? this.queryString.sort.split(',').join(' ') : '-createdAt';
    this.query = this.query.sort(sortBy);
    return this;
  }

  paginate() {
    const page = parseInt(this.queryString.page, 10) || 1;
    const limit = parseInt(this.queryString.limit, 10) || 10;
    this.query = this.query.skip((page - 1) * limit).limit(limit);
    return this;
  }

  async countTotal() {
    return this.query.model.countDocuments(this.query.getFilter());
  }
}