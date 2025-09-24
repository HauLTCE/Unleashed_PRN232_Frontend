import React from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { DashboardCard } from '../components/DashboardCard';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { TrendingUp, TrendingDown, Users, ShoppingCart, DollarSign, BarChart3 } from 'lucide-react';
import { dashboardStats, salesData, categoryData } from '../data/mockData';

export function AnalyticsPage() {
  const [timeRange, setTimeRange] = React.useState('monthly');

  // Mock data for different time ranges
  const customerGrowthData = [
    { month: 'Jan', customers: 120 },
    { month: 'Feb', customers: 135 },
    { month: 'Mar', customers: 158 },
    { month: 'Apr', customers: 180 },
    { month: 'May', customers: 210 },
    { month: 'Jun', customers: 245 },
  ];

  const trafficSourcesData = [
    { name: 'Direct', value: 40, color: '#576D64' },
    { name: 'Search', value: 30, color: '#AAC0B5' },
    { name: 'Social Media', value: 20, color: '#F8F5EE' },
    { name: 'Referrals', value: 10, color: '#000000' },
  ];

  const topProductsData = [
    { name: 'T-Shirts', sales: 450, revenue: 13500 },
    { name: 'Jeans', sales: 320, revenue: 28800 },
    { name: 'Dresses', sales: 280, revenue: 22400 },
    { name: 'Jackets', sales: 150, revenue: 30000 },
    { name: 'Shoes', sales: 200, revenue: 24000 },
  ];

  const conversionData = [
    { month: 'Jan', visitors: 5000, conversions: 150, rate: 3.0 },
    { month: 'Feb', visitors: 5500, conversions: 180, rate: 3.3 },
    { month: 'Mar', visitors: 6000, conversions: 210, rate: 3.5 },
    { month: 'Apr', visitors: 6200, conversions: 240, rate: 3.9 },
    { month: 'May', visitors: 6800, conversions: 280, rate: 4.1 },
    { month: 'Jun', visitors: 7200, conversions: 320, rate: 4.4 },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Analytics & Reports</h1>
            <p className="text-muted-foreground">Comprehensive insights into your business performance</p>
          </div>
          
          <div className="flex gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">Export Report</Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <DashboardCard
            title="Conversion Rate"
            value="4.2%"
            description="This month"
            icon={TrendingUp}
            trend={{ value: 0.8, isPositive: true }}
          />
          <DashboardCard
            title="Avg. Order Value"
            value="$89.50"
            description="Per order"
            icon={DollarSign}
            trend={{ value: 5.2, isPositive: true }}
          />
          <DashboardCard
            title="Customer Retention"
            value="68%"
            description="Return customers"
            icon={Users}
            trend={{ value: 3.1, isPositive: true }}
          />
          <DashboardCard
            title="Cart Abandonment"
            value="32%"
            description="Abandoned carts"
            icon={ShoppingCart}
            trend={{ value: 2.5, isPositive: false }}
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Sales & Revenue */}
          <Card>
            <CardHeader>
              <CardTitle>Sales & Revenue Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#576D64" 
                    fill="#AAC0B5"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Customer Growth */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={customerGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value}`, 'Customers']} />
                  <Line 
                    type="monotone" 
                    dataKey="customers" 
                    stroke="#576D64" 
                    strokeWidth={2}
                    dot={{ fill: '#576D64' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Traffic Sources */}
          <Card>
            <CardHeader>
              <CardTitle>Traffic Sources</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={trafficSourcesData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {trafficSourcesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Products */}
          <Card>
            <CardHeader>
              <CardTitle>Top Products by Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topProductsData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={60} />
                  <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                  <Bar dataKey="revenue" fill="#576D64" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Conversion Funnel */}
        <Card>
          <CardHeader>
            <CardTitle>Conversion Rate Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={conversionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Bar 
                  yAxisId="left"
                  dataKey="visitors" 
                  fill="#F8F5EE" 
                  name="Visitors"
                />
                <Bar 
                  yAxisId="left"
                  dataKey="conversions" 
                  fill="#AAC0B5" 
                  name="Conversions"
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="rate" 
                  stroke="#576D64" 
                  strokeWidth={3}
                  name="Conversion Rate (%)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Performance Summary */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                Best Performing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium">Category: Jackets</h4>
                <p className="text-sm text-muted-foreground">Highest revenue per item</p>
              </div>
              <div>
                <h4 className="font-medium">Time: Evening (6-9 PM)</h4>
                <p className="text-sm text-muted-foreground">Peak conversion hours</p>
              </div>
              <div>
                <h4 className="font-medium">Source: Direct Traffic</h4>
                <p className="text-sm text-muted-foreground">Highest quality visitors</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-red-500" />
                Needs Attention
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium">Mobile Conversion</h4>
                <p className="text-sm text-muted-foreground">15% lower than desktop</p>
              </div>
              <div>
                <h4 className="font-medium">Social Media ROI</h4>
                <p className="text-sm text-muted-foreground">Below average performance</p>
              </div>
              <div>
                <h4 className="font-medium">Checkout Abandonment</h4>
                <p className="text-sm text-muted-foreground">32% of users drop off</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-500" />
                Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium">Optimize Mobile UX</h4>
                <p className="text-sm text-muted-foreground">Improve mobile checkout flow</p>
              </div>
              <div>
                <h4 className="font-medium">Retargeting Campaign</h4>
                <p className="text-sm text-muted-foreground">Target cart abandoners</p>
              </div>
              <div>
                <h4 className="font-medium">Email Marketing</h4>
                <p className="text-sm text-muted-foreground">Increase customer retention</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}