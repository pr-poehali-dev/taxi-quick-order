import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

const Admin = () => {
  const [isAuth, setIsAuth] = useState(false);
  const [adminBalance, setAdminBalance] = useState(125400);
  const [cityName, setCityName] = useState('Павлово');
  const [shiftCost, setShiftCost] = useState('350');
  const [discountPercent, setDiscountPercent] = useState('30');
  const [siteMaintenance, setSiteMaintenance] = useState(false);

  const [users, setUsers] = useState([
    { id: 1, phone: '+79991234567', role: 'passenger', balance: '3500₽ / 1250Б', status: 'active' },
    { id: 2, phone: '+79997654321', role: 'driver', balance: '8450₽', status: 'active', shift: true },
  ]);

  const [transactions, setTransactions] = useState([
    { id: 1, user: '+79991234567', type: 'deposit_rub', amount: '1000₽', status: 'pending', date: '30.12.2024 14:30' },
    { id: 2, user: '+79997654321', type: 'withdrawal', amount: '5000₽', status: 'pending', date: '30.12.2024 13:15' },
  ]);

  const [orders, setOrders] = useState([
    { id: 1, passenger: '+79991234567', driver: '+79997654321', amount: '500₽', discount: '150₽', status: 'completed', date: '30.12.2024 12:00' },
  ]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuth(true);
    toast.success('Добро пожаловать в админ-панель!');
  };

  const handleTransactionAction = (id: number, action: 'approve' | 'reject') => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    toast.success(action === 'approve' ? 'Транзакция одобрена' : 'Транзакция отклонена');
  };

  const handleAddBalance = () => {
    const amount = prompt('Введите сумму пополнения баланса админа:');
    if (amount && !isNaN(Number(amount))) {
      setAdminBalance(prev => prev + Number(amount));
      toast.success(`Баланс пополнен на ${amount}₽`);
    }
  };

  if (!isAuth) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-destructive/10 via-background to-destructive/5"></div>
        
        <Card className="w-full max-w-md p-8 glass border-destructive/20 shadow-2xl relative z-10">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-destructive/20 flex items-center justify-center mx-auto mb-4">
              <Icon name="Shield" size={32} className="text-destructive" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Админ-панель</h1>
            <p className="text-muted-foreground">МДПС Такси</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label>Логин</Label>
              <Input type="text" placeholder="admin" className="h-12" defaultValue="admin" />
            </div>
            <div className="space-y-2">
              <Label>Пароль</Label>
              <Input type="password" placeholder="Введите пароль" className="h-12" defaultValue="admin123" />
            </div>
            <Button type="submit" className="w-full h-12 bg-destructive text-white hover:bg-destructive/90">
              <Icon name="LogIn" size={20} className="mr-2" />
              Войти в админку
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border glass sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-destructive flex items-center justify-center">
                <Icon name="Shield" size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Админ-панель</h1>
                <p className="text-sm text-muted-foreground">МДПС Такси</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Баланс админа</p>
                <p className="font-semibold text-xl text-secondary">{adminBalance.toLocaleString()} ₽</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsAuth(false)}>
                <Icon name="LogOut" size={20} />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard">Дашборд</TabsTrigger>
            <TabsTrigger value="users">Пользователи</TabsTrigger>
            <TabsTrigger value="transactions">Транзакции</TabsTrigger>
            <TabsTrigger value="orders">Заказы</TabsTrigger>
            <TabsTrigger value="settings">Настройки</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid md:grid-cols-4 gap-4">
              <Card className="p-6 glass">
                <div className="flex items-center justify-between mb-2">
                  <Icon name="Users" size={24} className="text-primary" />
                  <Badge>Всего</Badge>
                </div>
                <p className="text-3xl font-bold mb-1">127</p>
                <p className="text-sm text-muted-foreground">Пользователей</p>
              </Card>
              
              <Card className="p-6 glass">
                <div className="flex items-center justify-between mb-2">
                  <Icon name="Car" size={24} className="text-secondary" />
                  <Badge className="bg-green-500">Онлайн</Badge>
                </div>
                <p className="text-3xl font-bold mb-1">23</p>
                <p className="text-sm text-muted-foreground">Водителей на смене</p>
              </Card>

              <Card className="p-6 glass">
                <div className="flex items-center justify-between mb-2">
                  <Icon name="TrendingUp" size={24} className="text-blue-400" />
                  <Badge variant="outline">Сегодня</Badge>
                </div>
                <p className="text-3xl font-bold mb-1">342</p>
                <p className="text-sm text-muted-foreground">Заказов</p>
              </Card>

              <Card className="p-6 glass">
                <div className="flex items-center justify-between mb-2">
                  <Icon name="DollarSign" size={24} className="text-yellow-400" />
                  <Badge variant="outline">Доход</Badge>
                </div>
                <p className="text-3xl font-bold mb-1">8,050₽</p>
                <p className="text-sm text-muted-foreground">Оплаты смен</p>
              </Card>
            </div>

            <Card className="p-6 glass">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Баланс администратора</h3>
                <Button onClick={handleAddBalance} className="gradient-gold text-white">
                  <Icon name="Plus" size={18} className="mr-2" />
                  Пополнить
                </Button>
              </div>
              <div className="text-center py-8">
                <p className="text-5xl font-bold text-secondary mb-2">{adminBalance.toLocaleString()} ₽</p>
                <p className="text-muted-foreground">Используется для доплат водителям при скидках</p>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <Card className="p-6 glass">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Управление пользователями</h3>
                <Input placeholder="Поиск по телефону..." className="max-w-xs" />
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Телефон</TableHead>
                    <TableHead>Роль</TableHead>
                    <TableHead>Баланс</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map(user => (
                    <TableRow key={user.id}>
                      <TableCell>{user.id}</TableCell>
                      <TableCell className="font-medium">{user.phone}</TableCell>
                      <TableCell>
                        <Badge variant={user.role === 'driver' ? 'default' : 'secondary'}>
                          {user.role === 'driver' ? 'Водитель' : 'Пассажир'}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.balance}</TableCell>
                      <TableCell>
                        <Badge variant={user.status === 'active' ? 'default' : 'destructive'}>
                          {user.status === 'active' ? 'Активен' : 'Заблокирован'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Icon name="Edit" size={16} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4">
            <Card className="p-6 glass">
              <h3 className="text-xl font-bold mb-4">Ожидают обработки</h3>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Пользователь</TableHead>
                    <TableHead>Тип</TableHead>
                    <TableHead>Сумма</TableHead>
                    <TableHead>Дата</TableHead>
                    <TableHead>Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map(tx => (
                    <TableRow key={tx.id}>
                      <TableCell>{tx.id}</TableCell>
                      <TableCell className="font-medium">{tx.user}</TableCell>
                      <TableCell>
                        <Badge variant={tx.type.includes('deposit') ? 'default' : 'secondary'}>
                          {tx.type === 'deposit_rub' ? 'Пополнение ₽' : 
                           tx.type === 'deposit_bonus' ? 'Пополнение Б' : 'Вывод'}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold">{tx.amount}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{tx.date}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            className="bg-green-500 hover:bg-green-600"
                            onClick={() => handleTransactionAction(tx.id, 'approve')}
                          >
                            <Icon name="Check" size={16} className="mr-1" />
                            Одобрить
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleTransactionAction(tx.id, 'reject')}
                          >
                            <Icon name="X" size={16} className="mr-1" />
                            Отклонить
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            <Card className="p-6 glass">
              <h3 className="text-xl font-bold mb-4">Все заказы</h3>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Пассажир</TableHead>
                    <TableHead>Водитель</TableHead>
                    <TableHead>Сумма</TableHead>
                    <TableHead>Скидка</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Дата</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map(order => (
                    <TableRow key={order.id}>
                      <TableCell>{order.id}</TableCell>
                      <TableCell className="font-medium">{order.passenger}</TableCell>
                      <TableCell className="font-medium">{order.driver}</TableCell>
                      <TableCell>{order.amount}</TableCell>
                      <TableCell className="text-green-500">{order.discount}</TableCell>
                      <TableCell>
                        <Badge className="bg-green-500">{order.status === 'completed' ? 'Завершен' : order.status}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{order.date}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card className="p-6 glass">
              <h3 className="text-xl font-bold mb-4">Настройки системы</h3>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Название города</Label>
                  <Input 
                    value={cityName} 
                    onChange={(e) => setCityName(e.target.value)}
                    className="max-w-md"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Стоимость смены для водителей (₽)</Label>
                  <Input 
                    type="number"
                    value={shiftCost} 
                    onChange={(e) => setShiftCost(e.target.value)}
                    className="max-w-md"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Процент скидки при оплате через сайт (%)</Label>
                  <Input 
                    type="number"
                    value={discountPercent} 
                    onChange={(e) => setDiscountPercent(e.target.value)}
                    className="max-w-md"
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                  <div>
                    <p className="font-semibold">Режим технических работ</p>
                    <p className="text-sm text-muted-foreground">Отключить сайт для пользователей</p>
                  </div>
                  <Switch 
                    checked={siteMaintenance}
                    onCheckedChange={setSiteMaintenance}
                  />
                </div>

                <Button className="gradient-primary text-white">
                  <Icon name="Save" size={18} className="mr-2" />
                  Сохранить настройки
                </Button>
              </div>
            </Card>

            <Card className="p-6 glass border-destructive/50">
              <h3 className="text-xl font-bold mb-4 text-destructive">Опасная зона</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border border-destructive/50 bg-destructive/5">
                  <div>
                    <p className="font-semibold">Экспорт базы данных</p>
                    <p className="text-sm text-muted-foreground">Скачать полную копию БД</p>
                  </div>
                  <Button variant="outline">
                    <Icon name="Download" size={18} className="mr-2" />
                    Экспорт
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border border-destructive/50 bg-destructive/5">
                  <div>
                    <p className="font-semibold">Очистить историю заказов</p>
                    <p className="text-sm text-muted-foreground">Удалить все завершенные заказы</p>
                  </div>
                  <Button variant="destructive">
                    <Icon name="Trash2" size={18} className="mr-2" />
                    Очистить
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
