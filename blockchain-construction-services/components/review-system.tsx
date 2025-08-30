"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Star, ThumbsUp, Flag, Calendar } from "lucide-react"

interface Review {
  id: number
  reviewer: string
  reviewerName: string
  reviewerAvatar?: string
  rating: number
  comment: string
  timestamp: string
  isClient: boolean
  helpful: number
  serviceType: string
}

interface ReviewSystemProps {
  reviews: Review[]
  canReview?: boolean
  onSubmitReview?: (rating: number, comment: string) => void
  averageRating?: number
  totalReviews?: number
}

export function ReviewSystem({
  reviews,
  canReview = false,
  onSubmitReview,
  averageRating = 0,
  totalReviews = 0,
}: ReviewSystemProps) {
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [hoveredStar, setHoveredStar] = useState(0)

  const handleSubmitReview = () => {
    if (rating > 0 && comment.trim() && onSubmitReview) {
      onSubmitReview(rating, comment.trim())
      setRating(0)
      setComment("")
      setShowReviewForm(false)
    }
  }

  const renderStars = (rating: number, interactive = false, size = "h-4 w-4") => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`${size} cursor-pointer transition-colors ${
          i < (interactive ? hoveredStar || rating : Math.floor(rating))
            ? "fill-yellow-400 text-yellow-400"
            : "text-gray-300 hover:text-yellow-400"
        }`}
        onClick={interactive ? () => setRating(i + 1) : undefined}
        onMouseEnter={interactive ? () => setHoveredStar(i + 1) : undefined}
        onMouseLeave={interactive ? () => setHoveredStar(0) : undefined}
      />
    ))
  }

  const getRatingDistribution = () => {
    const distribution = [0, 0, 0, 0, 0]
    reviews.forEach((review) => {
      if (review.rating >= 1 && review.rating <= 5) {
        distribution[review.rating - 1]++
      }
    })
    return distribution.reverse() // 5 stars first
  }

  const ratingDistribution = getRatingDistribution()

  return (
    <div className="space-y-6">
      {/* Overall Rating Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Calificaciones y Reseñas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-center space-y-2">
              <div className="text-4xl font-bold">{averageRating.toFixed(1)}</div>
              <div className="flex items-center justify-center space-x-1">
                {renderStars(averageRating, false, "h-5 w-5")}
              </div>
              <div className="text-sm text-gray-600">{totalReviews} reseñas</div>
            </div>

            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((stars, index) => {
                const count = ratingDistribution[index]
                const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0
                return (
                  <div key={stars} className="flex items-center space-x-2 text-sm">
                    <span className="w-8">{stars}★</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="w-8 text-gray-600">{count}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {canReview && (
            <div className="mt-6 pt-6 border-t">
              {!showReviewForm ? (
                <Button onClick={() => setShowReviewForm(true)} className="w-full">
                  Escribir Reseña
                </Button>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Tu Calificación</label>
                    <div className="flex items-center space-x-1">{renderStars(rating, true, "h-6 w-6")}</div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Tu Comentario</label>
                    <Textarea
                      placeholder="Comparte tu experiencia con este contratista..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={4}
                    />
                  </div>

                  <div className="flex space-x-2">
                    <Button variant="outline" onClick={() => setShowReviewForm(false)} className="flex-1">
                      Cancelar
                    </Button>
                    <Button onClick={handleSubmitReview} disabled={rating === 0 || !comment.trim()} className="flex-1">
                      Publicar Reseña
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Individual Reviews */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <Card key={review.id}>
            <CardContent className="pt-6">
              <div className="flex items-start space-x-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={review.reviewerAvatar || "/placeholder.svg"} alt={review.reviewerName} />
                  <AvatarFallback>
                    {review.reviewerName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{review.reviewerName}</span>
                      <Badge variant={review.isClient ? "default" : "secondary"}>
                        {review.isClient ? "Cliente" : "Contratista"}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Calendar className="h-3 w-3" />
                      {review.timestamp}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {renderStars(review.rating)}
                    <span className="text-sm text-gray-600">• {review.serviceType}</span>
                  </div>

                  <p className="text-gray-700 leading-relaxed">{review.comment}</p>

                  <div className="flex items-center space-x-4 pt-2">
                    <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
                      <ThumbsUp className="h-3 w-3 mr-1" />
                      Útil ({review.helpful})
                    </Button>
                    <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
                      <Flag className="h-3 w-3 mr-1" />
                      Reportar
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {reviews.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <div className="text-gray-500">
              <Star className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Aún no hay reseñas</p>
              <p className="text-sm">Sé el primero en dejar una reseña</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
