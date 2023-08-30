export const useStoreEffect = (router) => {
  const showBookDetail = (book) => {
    router.push({
      path: '/store/detail',
      query: {
        fileName: book.fileName,
        category: book.category
      }
    })
  }

  return { showBookDetail }
}
