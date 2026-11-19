import { get, ref, query, set, remove } from 'firebase/database'
import { db } from '../../config/firebase-config'

export const getAllGoals = () => {
  return get(query(ref(db, 'goals')))
}

// Resolves to the owner's goals as an array (empty when they have none).
export const getUserGoals = ({ owner }) => {
  return get(ref(db, `goals/${owner}`))
    .then(snapshot => snapshot.exists() ? Object.values(snapshot.val()) : [])
}

export const createGoal = ({ id, name, owner, goal, progress, unit, from, to }) => {
  return set(ref(db, `goals/${owner}/${id}`), {
    id,
    name,
    owner,
    goal,
    progress,
    unit: unit ?? '',
    from,
    to,
  })
}

export const updateGoal = ({ id, owner, updates }) => {
  return set(ref(db, `goals/${owner}/${id}`), { ...updates, id, owner })
}

export const removeGoal = ({ id, owner }) => {
  return remove(ref(db, `goals/${owner}/${id}`))
}
