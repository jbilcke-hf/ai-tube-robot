
export const main = async () => {

  await processQueue()

  // loop every hour
  setTimeout(() => {
    main()
  }, 60 * 60 * 1000)
}