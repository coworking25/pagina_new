-- Migration: Add advanced appointment tracking columns
-- Date: September 16, 2025
-- Description: Add new columns for enhanced appointment status tracking and follow-up

-- Add timestamp columns for status tracking
ALTER TABLE property_appointments
ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS no_show_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS rescheduled_at TIMESTAMP WITH TIME ZONE;

-- Add follow-up and feedback columns
ALTER TABLE property_appointments
ADD COLUMN IF NOT EXISTS follow_up_notes TEXT,
ADD COLUMN IF NOT EXISTS rescheduled_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
ADD COLUMN IF NOT EXISTS actual_attendees INTEGER,
ADD COLUMN IF NOT EXISTS appointment_duration INTEGER,
ADD COLUMN IF NOT EXISTS appointment_rating INTEGER CHECK (appointment_rating >= 1 AND appointment_rating <= 5),
ADD COLUMN IF NOT EXISTS client_feedback TEXT;

-- Add comments for documentation
COMMENT ON COLUMN property_appointments.confirmed_at IS 'Timestamp when appointment was confirmed';
COMMENT ON COLUMN property_appointments.completed_at IS 'Timestamp when appointment was completed';
COMMENT ON COLUMN property_appointments.cancelled_at IS 'Timestamp when appointment was cancelled';
COMMENT ON COLUMN property_appointments.no_show_at IS 'Timestamp when client did not show up';
COMMENT ON COLUMN property_appointments.rescheduled_at IS 'Timestamp when appointment was rescheduled';
COMMENT ON COLUMN property_appointments.follow_up_notes IS 'Internal notes for follow-up actions';
COMMENT ON COLUMN property_appointments.rescheduled_date IS 'New date if appointment was rescheduled';
COMMENT ON COLUMN property_appointments.cancellation_reason IS 'Reason why appointment was cancelled';
COMMENT ON COLUMN property_appointments.actual_attendees IS 'Actual number of attendees (vs expected)';
COMMENT ON COLUMN property_appointments.appointment_duration IS 'Duration of appointment in minutes';
COMMENT ON COLUMN property_appointments.appointment_rating IS 'Client rating 1-5 stars';
COMMENT ON COLUMN property_appointments.client_feedback IS 'Client feedback/comments';