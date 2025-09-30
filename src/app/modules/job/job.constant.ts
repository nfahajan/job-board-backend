export const jobFilterableFields = [
  'searchTerm',
  'title',
  'location',
  'type',
  'salary',
  'minSalary',
  'maxSalary',
  'skills',
  'isActive',
  'sortBy',
];
export const jobSearchableFields = [
  'title',
  'location',
  'description',
  // Only string/text fields should be searched with `contains`
];

export const jobRelationalFields = ['company'];

export const jobRelationalFieldsMapper: { [key: string]: string } = {
  companyId: 'company',
};
