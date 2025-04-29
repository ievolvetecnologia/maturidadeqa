// Tipos para autenticação
export interface User {
  id: string
  name: string
  email: string
  password: string
  role: "admin" | "user"
  createdAt: string
  lastLogin?: string
  active: boolean
}

// Função para inicializar o usuário admin se não existir
export function initializeAdminUser() {
  const users = JSON.parse(localStorage.getItem("sqm-users") || "[]")

  // Verificar se já existe um usuário admin
  const adminExists = users.some((user: User) => user.role === "admin")

  if (!adminExists) {
    // Criar usuário admin padrão
    const adminUser: User = {
      id: "admin-" + Date.now(),
      name: "Administrador",
      email: "admin@exemplo.com",
      password: "admin123", // Em produção, isso deveria ser um hash
      role: "admin",
      createdAt: new Date().toISOString(),
      active: true,
    }

    users.push(adminUser)
    localStorage.setItem("sqm-users", JSON.stringify(users))
  }
}

// Função para autenticar usuário
export function authenticateUser(email: string, password: string): User | null {
  const users = JSON.parse(localStorage.getItem("sqm-users") || "[]")

  const user = users.find((u: User) => u.email === email && u.password === password && u.active)

  if (user) {
    // Atualizar último login
    const updatedUsers = users.map((u: User) => {
      if (u.id === user.id) {
        return {
          ...u,
          lastLogin: new Date().toISOString(),
        }
      }
      return u
    })

    localStorage.setItem("sqm-users", JSON.stringify(updatedUsers))

    // Salvar usuário na sessão
    sessionStorage.setItem("sqm-current-user", JSON.stringify(user))

    return user
  }

  return null
}

// Função para verificar se o usuário está autenticado
export function isAuthenticated(): boolean {
  const user = sessionStorage.getItem("sqm-current-user")
  return !!user
}

// Função para verificar se o usuário é admin
export function isAdmin(): boolean {
  const userStr = sessionStorage.getItem("sqm-current-user")
  if (!userStr) return false

  const user = JSON.parse(userStr)
  return user.role === "admin"
}

// Função para obter o usuário atual
export function getCurrentUser(): User | null {
  const userStr = sessionStorage.getItem("sqm-current-user")
  if (!userStr) return null

  return JSON.parse(userStr)
}

// Função para logout
export function logout(): void {
  sessionStorage.removeItem("sqm-current-user")
}

// Função para obter todos os usuários
export function getAllUsers(): User[] {
  return JSON.parse(localStorage.getItem("sqm-users") || "[]")
}

// Função para adicionar um novo usuário
export function addUser(user: Omit<User, "id" | "createdAt">): User {
  const users = getAllUsers()

  // Verificar se o email já existe
  const emailExists = users.some((u: User) => u.email === user.email)
  if (emailExists) {
    throw new Error("Email já cadastrado")
  }

  const newUser: User = {
    ...user,
    id: "user-" + Date.now(),
    createdAt: new Date().toISOString(),
  }

  users.push(newUser)
  localStorage.setItem("sqm-users", JSON.stringify(users))

  return newUser
}

// Função para atualizar um usuário
export function updateUser(id: string, userData: Partial<User>): User {
  const users = getAllUsers()

  // Verificar se o email já existe em outro usuário
  if (userData.email) {
    const emailExists = users.some((u: User) => u.email === userData.email && u.id !== id)
    if (emailExists) {
      throw new Error("Email já cadastrado para outro usuário")
    }
  }

  const updatedUsers = users.map((user: User) => {
    if (user.id === id) {
      return {
        ...user,
        ...userData,
      }
    }
    return user
  })

  localStorage.setItem("sqm-users", JSON.stringify(updatedUsers))

  const updatedUser = updatedUsers.find((u: User) => u.id === id)
  return updatedUser as User
}

// Função para excluir um usuário
export function deleteUser(id: string): void {
  const users = getAllUsers()

  // Não permitir excluir o último admin
  const admins = users.filter((u: User) => u.role === "admin")
  const userToDelete = users.find((u: User) => u.id === id)

  if (userToDelete?.role === "admin" && admins.length <= 1) {
    throw new Error("Não é possível excluir o último administrador")
  }

  // Soft delete - apenas marca como inativo
  const updatedUsers = users.map((user: User) => {
    if (user.id === id) {
      return {
        ...user,
        active: false,
      }
    }
    return user
  })

  localStorage.setItem("sqm-users", JSON.stringify(updatedUsers))
}

// Função para obter um usuário por ID
export function getUserById(id: string): User | null {
  const users = getAllUsers()
  return users.find((u: User) => u.id === id) || null
}
