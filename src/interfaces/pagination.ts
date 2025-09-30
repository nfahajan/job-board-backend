type IPaginationOption = {
  page?: number;
  size?: number;
  sortOrder?: 'asc' | 'desc';
  sortBy?: string;
  minPrice?: number;
  maxPrice?: number;
};

export default IPaginationOption;
