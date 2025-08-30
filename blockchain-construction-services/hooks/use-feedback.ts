"use client"

import { useState, useCallback } from "react"
import { useBlockchain } from "./use-blockchain"

interface Review {
  id: number
  serviceId: number
  reviewer: string
  contractor: string
  rating: number
  comment: string
  timestamp: number
  isClient: boolean
}

interface ContractorReputation {
  totalReviews: number
  averageRating: number
  completedJobs: number
  totalEarnings: string
}

export function useFeedback() {
  const { account, contract } = useBlockchain()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submitReview = useCallback(
    async (serviceId: number, rating: number, comment: string) => {
      if (!contract || !account) {
        throw new Error("Wallet not connected")
      }

      setLoading(true)
      setError(null)

      try {
        console.log("[v0] Submitting review for service:", serviceId)

        const tx = await contract.submitReview(serviceId, rating, comment)
        await tx.wait()

        console.log("[v0] Review submitted successfully")
        return tx.hash
      } catch (err: any) {
        console.error("[v0] Error submitting review:", err)
        setError(err.message || "Error al enviar la reseña")
        throw err
      } finally {
        setLoading(false)
      }
    },
    [contract, account],
  )

  const getContractorReviews = useCallback(
    async (contractorAddress: string): Promise<Review[]> => {
      if (!contract) {
        throw new Error("Contract not initialized")
      }

      setLoading(true)
      setError(null)

      try {
        console.log("[v0] Fetching reviews for contractor:", contractorAddress)

        const reviews = await contract.getContractorReviews(contractorAddress)

        const formattedReviews = reviews.map((review: any, index: number) => ({
          id: index,
          serviceId: review.serviceId.toNumber(),
          reviewer: review.reviewer,
          contractor: review.contractor,
          rating: review.rating,
          comment: review.comment,
          timestamp: review.timestamp.toNumber(),
          isClient: true,
        }))

        console.log("[v0] Reviews fetched:", formattedReviews.length)
        return formattedReviews
      } catch (err: any) {
        console.error("[v0] Error fetching reviews:", err)
        setError(err.message || "Error al obtener las reseñas")
        return []
      } finally {
        setLoading(false)
      }
    },
    [contract],
  )

  const getContractorReputation = useCallback(
    async (contractorAddress: string): Promise<ContractorReputation> => {
      if (!contract) {
        throw new Error("Contract not initialized")
      }

      setLoading(true)
      setError(null)

      try {
        console.log("[v0] Fetching reputation for contractor:", contractorAddress)

        const reputation = await contract.getContractorReputation(contractorAddress)

        const formattedReputation = {
          totalReviews: reputation.totalReviews.toNumber(),
          averageRating: reputation.averageRating / 100, // Assuming rating is stored as integer * 100
          completedJobs: reputation.completedJobs.toNumber(),
          totalEarnings: reputation.totalEarnings.toString(),
        }

        console.log("[v0] Reputation fetched:", formattedReputation)
        return formattedReputation
      } catch (err: any) {
        console.error("[v0] Error fetching reputation:", err)
        setError(err.message || "Error al obtener la reputación")
        return {
          totalReviews: 0,
          averageRating: 0,
          completedJobs: 0,
          totalEarnings: "0",
        }
      } finally {
        setLoading(false)
      }
    },
    [contract],
  )

  const reportReview = useCallback(
    async (reviewId: number, reason: string) => {
      if (!contract || !account) {
        throw new Error("Wallet not connected")
      }

      setLoading(true)
      setError(null)

      try {
        console.log("[v0] Reporting review:", reviewId)

        const tx = await contract.reportReview(reviewId, reason)
        await tx.wait()

        console.log("[v0] Review reported successfully")
        return tx.hash
      } catch (err: any) {
        console.error("[v0] Error reporting review:", err)
        setError(err.message || "Error al reportar la reseña")
        throw err
      } finally {
        setLoading(false)
      }
    },
    [contract, account],
  )

  return {
    submitReview,
    getContractorReviews,
    getContractorReputation,
    reportReview,
    loading,
    error,
  }
}
