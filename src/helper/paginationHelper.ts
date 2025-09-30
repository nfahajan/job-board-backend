type IOptions = {
  page?: number;
  size?: number;
  sortBy?: string;
  sortOrder?: string;
};

type IOptionsResults = {
  page: number;
  size: number;
  skip: number;
  sortBy?: string;
  sortOrder?: string;
};

const calculatePagination = (option: IOptions): IOptionsResults => {
  const page = Number(option.page || 1);
  const size = Number(option.size || 10);
  const skip = (page - 1) * size;
  const sortBy = option.sortBy || 'createdAt';
  const sortOrder = option.sortOrder || 'desc';
  return {
    page,
    size,
    skip,
    sortBy,
    sortOrder,
  };
};

export const paginationHelper = {
  calculatePagination,
};
