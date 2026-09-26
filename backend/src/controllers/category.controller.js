import { getActiveCategories } from '../repositories/category.repository.js'

export async function getCategoriesController(req, res) {
  const categories = await getActiveCategories()
  return res.status(200).json({ status: 200, data: categories })
}
