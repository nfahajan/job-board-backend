import { User } from '@prisma/client';
import prisma from '../../../shared/prisma';

const getAllFromDb = async () => {
  const result = await prisma.user.findMany();
  return result;
};

const getByIdFromDb = async (id: string) => {
  const result = await prisma.user.findUnique({
    where: {
      id: id,
    },
    include: {
      profile: true,
      companies: {
        include: {
          company: true,
        },
      },
    },
  });
  return result;
};

const getMe = async (userId: string) => {
  const result = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      profile: true,
      companies: {
        include: {
          company: true,
        },
      },
    },
  });
  return result;
};

const deleteByIdFromDb = async (id: string) => {
  const result = await prisma.user.delete({
    where: {
      id: id,
    },
  });
  return result;
};

const updateByIdFromDb = async (
  id: string,
  payload: User
) => {
  const result = await prisma.user.update({
    where: {
      id: (id),
    },
    data: payload,
  });
  return result;
};

export const UserService = {
  getAllFromDb,
  getByIdFromDb,
  getMe,
  updateByIdFromDb,
  deleteByIdFromDb,
};