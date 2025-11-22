import catchAsync from "@/handlers/async.handler";
import type { Request, Response } from "express";
import { AuthService } from "@/services/auth.service";
import { validate } from "@/middlewares/validation.middleware";
import { userRegistrationSchema, userLoginSchema, updateUserSchema, changePasswordSchema } from "@/validations";

const register = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const user = await AuthService.register(req.body);

  res.status(201).json({
    status: "success",
    message: "User registered successfully",
    data: {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt
      }
    }
  });
});

const login = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { user, accessToken, refreshToken } = await AuthService.login(req.body);

  res.status(200).json({
    status: "success",
    message: "Login successful",
    data: {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        lastLogin: user.lastLogin
      },
      tokens: {
        accessToken,
        refreshToken
      }
    }
  });
});

const refresh_token = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    res.status(400).json({
      status: "error",
      message: "Refresh token is required"
    });
    return;
  }

  const tokens = await AuthService.refreshToken(refreshToken);

  res.status(200).json({
    status: "success",
    message: "Token refreshed successfully",
    data: {
      tokens
    }
  });
});

const logout = catchAsync(async (req: Request & { user?: any }, res: Response): Promise<void> => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (token) {
    await AuthService.logout(token);
  }

  res.status(200).json({
    status: "success",
    message: "Logout successful"
  });
});

const get_profile = catchAsync(async (req: Request & { user?: any }, res: Response): Promise<void> => {
  const user = await AuthService.getProfile(req.user.userId);

  res.status(200).json({
    status: "success",
    data: {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    }
  });
});

const update_profile = catchAsync(async (req: Request & { user?: any }, res: Response): Promise<void> => {
  const user = await AuthService.updateProfile(req.user.userId, req.body);

  res.status(200).json({
    status: "success",
    message: "Profile updated successfully",
    data: {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        updatedAt: user.updatedAt
      }
    }
  });
});

const change_password = catchAsync(async (req: Request & { user?: any }, res: Response): Promise<void> => {
  await AuthService.changePassword(req.user.userId, req.body);

  res.status(200).json({
    status: "success",
    message: "Password changed successfully"
  });
});

export default {
  register: [validate(userRegistrationSchema), register],
  login: [validate(userLoginSchema), login],
  refresh_token,
  logout,
  get_profile,
  update_profile: [validate(updateUserSchema), update_profile],
  change_password: [validate(changePasswordSchema), change_password]
};