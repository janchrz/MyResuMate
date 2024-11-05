import React from 'react'
import { motion } from 'framer-motion'
import { ResumeData } from './ResumeForm'

interface ResumePreviewProps {
  data: ResumeData
}

export function ResumePreview({ data }: ResumePreviewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-white p-6 rounded-lg shadow-lg"
    >
      <h2 className="text-2xl font-bold mb-4">{data.name}</h2>
      <p className="mb-2">{data.email} | {data.phone}</p>
      <h3 className="text-xl font-semibold mt-4 mb-2">Education</h3>
      <p>{data.education}</p>
      <h3 className="text-xl font-semibold mt-4 mb-2">Experience</h3>
      <p>{data.experience}</p>
      <h3 className="text-xl font-semibold mt-4 mb-2">Skills</h3>
      <p>{data.skills}</p>
    </motion.div>
  )
}