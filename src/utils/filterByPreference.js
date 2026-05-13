export function filterByPreference(items, preference) {
  if (preference === 'veg') return items.filter(i => i.isVeg === true)
  return items // non-veg sees everything
}

export function isVegKeyword(name = '') {
  const veg = ['salad', 'lentil', 'dal', 'paneer', 'tofu', 'veggie', 'vegetable',
    'fruit', 'oats', 'rice', 'bread', 'pasta', 'soup', 'hummus', 'quinoa',
    'bean', 'chickpea', 'avocado', 'mushroom', 'cheese', 'yogurt', 'milk',
    'butter', 'egg', 'idli', 'dosa', 'upma', 'poha', 'dhokla']
  const nonVeg = ['chicken', 'beef', 'pork', 'fish', 'salmon', 'tuna', 'shrimp',
    'prawn', 'mutton', 'lamb', 'turkey', 'bacon', 'sausage', 'meat', 'steak']
  const lower = name.toLowerCase()
  if (nonVeg.some(k => lower.includes(k))) return false
  if (veg.some(k => lower.includes(k))) return true
  return true // default assume veg if unknown
}
