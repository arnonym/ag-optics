import { L, O, pipe } from './api';

interface Company {
  name: string;
  phone?: string;
  address?: Address;
}

interface Address {
  street: string;
  city: string;
  postalCode: string;
}

interface Person {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  company?: Company;
  address: Address;
  tags: string[];
}

const examplePerson: Person = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phoneNumber: '123-456-7890',
  company: {
    name: 'Tech Solutions Inc.',
    phone: '987-654-3210',
    address: {
      street: '123 Company Street',
      city: 'Nowhere',
      postalCode: '98765',
    },
  },
  address: {
    street: '123 Elm Street',
    city: 'Somewhere',
    postalCode: '12345',
  },
  tags: ['developer', 'typescript', 'remote'],
};

const cityLens = pipe(L.id<Person>(), L.prop('address'), L.prop('city'));
cityLens.get(examplePerson);
// Somewhere

const companyLens = pipe(L.id<Person>(), L.prop('company'));

const companyPhoneLens = pipe(companyLens, O.prop('phone'));
companyPhoneLens.get(examplePerson);
// 987-654-3210

const updatedExamplePerson = pipe(
  companyLens,
  O.prop('address'),
  O.prop('street'),
).set('Another street')(examplePerson);

const firstTagLens = pipe(L.id<Person>(), L.prop('tags'), O.idx(0));
firstTagLens.get(examplePerson);
// developer
