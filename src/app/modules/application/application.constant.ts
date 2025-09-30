export const applicationFilterableFields = ['searchTerm', 'title', 'location', 'type', 'salary'];
export const applicationSearchableFields = ['title', 'location', 'type', 'description', 'salary'];

export const applicationRelationalFields = ['company'];

export const applicationRelationalFieldsMapper: { [key: string]: string } = {
  companyId: 'company',
};
