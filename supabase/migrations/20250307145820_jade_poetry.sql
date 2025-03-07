/*
  # Add subscription management tables

  1. New Tables
    - `subscription_plans`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `price_id` (text, Stripe price ID)
      - `price` (integer, in cents)
      - `interval` (text: monthly, yearly, or four_yearly)
      - `features` (text array)
      - `created_at` (timestamptz)

    - `subscriptions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `plan_id` (uuid, references subscription_plans)
      - `stripe_subscription_id` (text)
      - `stripe_customer_id` (text)
      - `status` (text)
      - `current_period_end` (timestamptz)
      - `cancel_at` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for secure access
*/

-- Create subscription_plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price_id text NOT NULL UNIQUE,
  price integer NOT NULL,
  interval text NOT NULL CHECK (interval IN ('monthly', 'yearly', 'four_yearly')),
  features text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  plan_id uuid REFERENCES subscription_plans NOT NULL,
  stripe_subscription_id text UNIQUE,
  stripe_customer_id text,
  status text NOT NULL,
  current_period_end timestamptz,
  cancel_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

-- Enable RLS
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies for subscription_plans
CREATE POLICY "Anyone can read subscription plans"
  ON subscription_plans
  FOR SELECT
  TO public
  USING (true);

-- Create policies for subscriptions
CREATE POLICY "Users can read own subscription"
  ON subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage subscriptions"
  ON subscriptions
  USING (auth.role() = 'service_role');

-- Create updated_at trigger
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
CREATE INDEX idx_subscription_plans_price_id ON subscription_plans(price_id);

-- Insert initial subscription plans
INSERT INTO subscription_plans (name, description, price_id, price, interval, features) VALUES
  ('Monthly Plan', 'Perfect for short-term use', 'price_monthly', 999, 'monthly', ARRAY[
    'Unlimited courses',
    'Unlimited tasks',
    'Email notifications',
    'Priority support'
  ]),
  ('Annual Plan', 'Save 20% with yearly billing', 'price_yearly', 9590, 'yearly', ARRAY[
    'All Monthly Plan features',
    '20% discount',
    'Advanced analytics',
    'API access'
  ]),
  ('4-Year Plan', 'Best value for long-term students', 'price_four_yearly', 33900, 'four_yearly', ARRAY[
    'All Annual Plan features',
    '30% discount',
    'Custom integrations',
    'Dedicated support'
  ]);