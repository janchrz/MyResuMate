import React from 'react'
import { motion } from 'framer-motion'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Button } from './ui/button'

interface ResumeFormProps {
  onSubmit: (data: ResumeData) => void
}

export interface ResumeData {
  name: string
  email: string
  phone: string
  education: string
  experience: string
  skills: string
}

export function ResumeForm({ onSubmit }: ResumeFormProps) {
  const [formData, setFormData] = React.useState<ResumeData>({
    name: '',
    email: '',
    phone: '',
    education: '',
    experience: '',
    skills: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      <div>
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
      </div>
      <div>
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} required />
      </div>
      <div>
        <Label htmlFor="education">Education</Label>
        <Input id="education" name="education" value={formData.education} onChange={handleChange} required />
      </div>
      <div>
        <Label htmlFor="experience">Experience</Label>
        <Input id="experience" name="experience" value={formData.experience} onChange={handleChange} required />
      </div>
      <div>
        <Label htmlFor="skills">Skills</Label>
        <Input id="skills" name="skills" value={formData.skills} onChange={handleChange} required />
      </div>
      <Button type="submit">Generate Resume</Button>
    </motion.form>
  )
}