import { Request, Response } from 'express'
import * as rewardsService from '../../backend/controllers/rewardsController'

export async function getAllRewardsAdmin(req: Request, res: Response) {
  return rewardsService.getAllRewardsAdmin(req, res)
}

export async function getActiveRewards(req: Request, res: Response) {
  return rewardsService.getActiveRewards(req, res)
}

export async function createReward(req: Request, res: Response) {
  return rewardsService.createReward(req, res)
}

export async function updateReward(req: Request, res: Response) {
  return rewardsService.updateReward(req, res)
}

export async function toggleReward(req: Request, res: Response) {
  return rewardsService.toggleReward(req, res)
}

export async function deleteReward(req: Request, res: Response) {
  return rewardsService.deleteReward(req, res)
}

export async function redeemReward(req: Request, res: Response) {
  return rewardsService.redeemReward(req, res)
}

export async function getMyRedemptions(req: Request, res: Response) {
  return rewardsService.getMyRedemptions(req, res)
}

export async function getLeaderboard(req: Request, res: Response) {
  return rewardsService.getLeaderboard(req, res)
}

export async function getMyPoints(req: Request, res: Response) {
  return rewardsService.getMyPoints(req, res)
}
