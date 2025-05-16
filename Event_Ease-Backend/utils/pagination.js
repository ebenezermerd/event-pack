// utils/pagination.js
const getPagination = (page, size) => {
  const limit = size ? +size : 10
  const offset = page ? (page - 1) * limit : 0

  return { limit, offset }
}

const getPagingData = (count, page, limit) => {
  const currentPage = page ? +page : 1
  const totalPages = Math.ceil(count / limit)

  return {
    total: count,
    page: currentPage,
    limit,
    pages: totalPages,
  }
}

module.exports = {
  getPagination,
  getPagingData,
}
