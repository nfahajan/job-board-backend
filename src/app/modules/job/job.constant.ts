export const jobFilterableFields = ['searchTerm', 'title', 'location', 'type', 'salary'];
export const jobSearchableFields = ['title', 'location', 'type', 'description', 'salary'];

export const jobRelationalFields = ['company'];

export const jobRelationalFieldsMapper: { [key: string]: string } = {
  companyId: 'company',
};
