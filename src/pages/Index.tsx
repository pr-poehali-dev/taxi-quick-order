import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

const Index = () => {
  const [isAuth, setIsAuth] = useState(false);
  const [userRole, setUserRole] = useState<'passenger' | 'driver' | null>(null);
  const [orderAmount, setOrderAmount] = useState('500');
  const [paymentMethod, setPaymentMethod] = useState<'bonus' | 'rub' | 'cash'>('rub');
  const [passengerBalance] = useState({ bonus: 1250, rub: 3500 });
  const [driverBalance] = useState(8450);

  const calculateDiscount = (amount: number, method: 'bonus' | 'rub' | 'cash') => {
    if (method === 'cash') return { final: amount, discount: 0 };
    const discount = Math.round(amount * 0.3);
    return { final: amount - discount, discount };
  };

  const handleLogin = (role: 'passenger' | 'driver') => {
    setUserRole(role);
    setIsAuth(true);
    toast.success(`Добро пожаловать, ${role === 'passenger' ? 'пассажир' : 'водитель'}!`);
  };

  if (!isAuth) {
    return (
      <div className="min-h-screen bg-background">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/5"></div>
        
        <div className="relative z-10">
          <header className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center">
                  <Icon name="Car" size={24} className="text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">МДПС Такси</h1>
                  <p className="text-sm text-muted-foreground">Павлово</p>
                </div>
              </div>
            </div>
          </header>

          <section className="container mx-auto px-4 py-20">
            <div className="max-w-6xl mx-auto">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6 animate-fade-in">
                  <Badge className="gradient-primary border-0 text-white">Премиум сервис</Badge>
                  <h2 className="text-5xl font-bold leading-tight">
                    Быстрое такси
                    <span className="block gradient-primary bg-clip-text text-transparent">в вашем городе</span>
                  </h2>
                  <p className="text-xl text-muted-foreground">
                    Скидка 30% при оплате через баланс. Быстрая подача. Надежные водители.
                  </p>
                  <div className="flex flex-wrap gap-6 pt-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl glass flex items-center justify-center">
                        <Icon name="Clock" size={20} className="text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">3 мин</p>
                        <p className="text-sm text-muted-foreground">Средняя подача</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl glass flex items-center justify-center">
                        <Icon name="Star" size={20} className="text-secondary" />
                      </div>
                      <div>
                        <p className="font-semibold">4.9</p>
                        <p className="text-sm text-muted-foreground">Рейтинг сервиса</p>
                      </div>
                    </div>
                  </div>
                </div>

                <Card className="p-8 glass border-primary/20 shadow-2xl">
                  <Tabs defaultValue="passenger">
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                      <TabsTrigger value="passenger">Пассажир</TabsTrigger>
                      <TabsTrigger value="driver">Водитель</TabsTrigger>
                    </TabsList>

                    <TabsContent value="passenger" className="space-y-4">
                      <div className="space-y-2">
                        <Label>Номер телефона</Label>
                        <Input type="tel" placeholder="+7 (999) 123-45-67" className="h-12" />
                      </div>
                      <div className="space-y-2">
                        <Label>Пароль</Label>
                        <Input type="password" placeholder="Введите пароль" className="h-12" />
                      </div>
                      <Button 
                        className="w-full h-12 gradient-primary text-white hover:opacity-90 transition-opacity"
                        onClick={() => handleLogin('passenger')}
                      >
                        Войти как пассажир
                      </Button>
                      <Button variant="ghost" className="w-full">
                        Регистрация
                      </Button>
                    </TabsContent>

                    <TabsContent value="driver" className="space-y-4">
                      <div className="space-y-2">
                        <Label>Номер телефона</Label>
                        <Input type="tel" placeholder="+7 (999) 123-45-67" className="h-12" />
                      </div>
                      <div className="space-y-2">
                        <Label>Пароль</Label>
                        <Input type="password" placeholder="Введите пароль" className="h-12" />
                      </div>
                      <Button 
                        className="w-full h-12 gradient-gold text-white hover:opacity-90 transition-opacity"
                        onClick={() => handleLogin('driver')}
                      >
                        Войти как водитель
                      </Button>
                      <Button variant="ghost" className="w-full">
                        Регистрация водителя
                      </Button>
                    </TabsContent>
                  </Tabs>
                </Card>
              </div>
            </div>
          </section>

          <section className="container mx-auto px-4 py-20">
            <div className="max-w-6xl mx-auto">
              <h3 className="text-3xl font-bold text-center mb-12">Преимущества сервиса</h3>
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  { icon: 'Percent', title: 'Скидка 30%', desc: 'При оплате через баланс сайта' },
                  { icon: 'Shield', title: 'Безопасность', desc: 'Проверенные водители и SOS кнопка' },
                  { icon: 'Zap', title: 'Быстро', desc: 'Средняя подача всего 3 минуты' },
                ].map((item, i) => (
                  <Card key={i} className="p-6 glass hover:border-primary/50 transition-all hover-scale">
                    <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mb-4">
                      <Icon name={item.icon as any} size={24} className="text-white" />
                    </div>
                    <h4 className="text-xl font-semibold mb-2">{item.title}</h4>
                    <p className="text-muted-foreground">{item.desc}</p>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    );
  }

  if (userRole === 'passenger') {
    const { final, discount } = calculateDiscount(parseInt(orderAmount) || 0, paymentMethod);

    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border glass sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                  <Icon name="Car" size={20} className="text-white" />
                </div>
                <h1 className="text-xl font-bold">МДПС Такси</h1>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Бонусы</p>
                  <p className="font-semibold">{passengerBalance.bonus} Б</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Рубли</p>
                  <p className="font-semibold">{passengerBalance.rub} ₽</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsAuth(false)}>
                  <Icon name="LogOut" size={20} />
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto space-y-6">
            <Card className="p-6 glass">
              <h2 className="text-2xl font-bold mb-6">Быстрый заказ такси</h2>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Откуда</Label>
                  <Input placeholder="Адрес подачи" className="h-12" />
                </div>

                <div className="space-y-2">
                  <Label>Куда</Label>
                  <Input placeholder="Адрес назначения" className="h-12" />
                </div>

                <div className="space-y-2">
                  <Label>Стоимость поездки (₽)</Label>
                  <Input 
                    type="number" 
                    value={orderAmount}
                    onChange={(e) => setOrderAmount(e.target.value)}
                    className="h-12 text-xl font-semibold"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Способ оплаты</Label>
                  <div className="grid grid-cols-3 gap-3">
                    <Button
                      variant={paymentMethod === 'rub' ? 'default' : 'outline'}
                      className={paymentMethod === 'rub' ? 'gradient-primary text-white' : ''}
                      onClick={() => setPaymentMethod('rub')}
                    >
                      <Icon name="Wallet" size={18} className="mr-2" />
                      Рубли
                    </Button>
                    <Button
                      variant={paymentMethod === 'bonus' ? 'default' : 'outline'}
                      className={paymentMethod === 'bonus' ? 'gradient-primary text-white' : ''}
                      onClick={() => setPaymentMethod('bonus')}
                    >
                      <Icon name="Gift" size={18} className="mr-2" />
                      Бонусы
                    </Button>
                    <Button
                      variant={paymentMethod === 'cash' ? 'default' : 'outline'}
                      onClick={() => setPaymentMethod('cash')}
                    >
                      <Icon name="Banknote" size={18} className="mr-2" />
                      Наличные
                    </Button>
                  </div>
                </div>

                {paymentMethod !== 'cash' && (
                  <Card className="p-4 bg-primary/10 border-primary/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">Стоимость поездки:</span>
                      <span className="font-semibold">{orderAmount} ₽</span>
                    </div>
                    <div className="flex items-center justify-between mb-2 text-green-400">
                      <span className="text-sm">Скидка 30%:</span>
                      <span className="font-semibold">-{discount} ₽</span>
                    </div>
                    <div className="flex items-center justify-between text-xl font-bold pt-2 border-t border-primary/20">
                      <span>К оплате:</span>
                      <span>{final} {paymentMethod === 'rub' ? '₽' : 'Б'}</span>
                    </div>
                  </Card>
                )}

                <div className="space-y-2">
                  <Label>Комментарий</Label>
                  <Input placeholder="Дополнительная информация" />
                </div>

                <Button className="w-full h-14 gradient-primary text-white text-lg hover:opacity-90 transition-opacity">
                  <Icon name="Navigation" size={20} className="mr-2" />
                  Заказать такси
                </Button>
              </div>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" size="lg" className="h-16">
                <Icon name="History" size={20} className="mr-2" />
                История поездок
              </Button>
              <Button variant="outline" size="lg" className="h-16 border-red-500 text-red-500 hover:bg-red-500/10">
                <Icon name="AlertCircle" size={20} className="mr-2" />
                SOS
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (userRole === 'driver') {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border glass sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl gradient-gold flex items-center justify-center">
                  <Icon name="Car" size={20} className="text-white" />
                </div>
                <h1 className="text-xl font-bold">Кабинет водителя</h1>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Баланс</p>
                  <p className="font-semibold text-xl">{driverBalance} ₽</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsAuth(false)}>
                  <Icon name="LogOut" size={20} />
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-6">
            <Card className="p-6 glass border-secondary/50">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Открыть смену</h2>
                <Badge className="gradient-gold border-0 text-white text-lg px-4 py-2">
                  350 ₽/сутки
                </Badge>
              </div>
              <p className="text-muted-foreground mb-4">
                После оплаты смены вы сможете принимать заказы в течение 24 часов
              </p>
              <Button className="w-full h-14 gradient-gold text-white text-lg hover:opacity-90 transition-opacity">
                <Icon name="PlayCircle" size={20} className="mr-2" />
                Оплатить смену (350 ₽)
              </Button>
            </Card>

            <div className="grid md:grid-cols-3 gap-4">
              <Card className="p-6 glass text-center">
                <Icon name="TrendingUp" size={32} className="mx-auto mb-3 text-primary" />
                <p className="text-2xl font-bold mb-1">24</p>
                <p className="text-sm text-muted-foreground">Поездок сегодня</p>
              </Card>
              <Card className="p-6 glass text-center">
                <Icon name="DollarSign" size={32} className="mx-auto mb-3 text-secondary" />
                <p className="text-2xl font-bold mb-1">6,840 ₽</p>
                <p className="text-sm text-muted-foreground">Заработано сегодня</p>
              </Card>
              <Card className="p-6 glass text-center">
                <Icon name="Star" size={32} className="mx-auto mb-3 text-yellow-400" />
                <p className="text-2xl font-bold mb-1">4.8</p>
                <p className="text-sm text-muted-foreground">Ваш рейтинг</p>
              </Card>
            </div>

            <Card className="p-6 glass">
              <h3 className="text-xl font-bold mb-4">Информация о водителе</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Марка автомобиля</Label>
                    <Input placeholder="Toyota" />
                  </div>
                  <div className="space-y-2">
                    <Label>Цвет</Label>
                    <Input placeholder="Белый" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Номер автомобиля</Label>
                  <Input placeholder="А123БВ 777" />
                </div>
                <div className="space-y-2">
                  <Label>Водительское удостоверение</Label>
                  <Input placeholder="1234 567890" />
                </div>
                <Button className="w-full gradient-primary text-white">
                  Сохранить изменения
                </Button>
              </div>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" size="lg" className="h-16">
                <Icon name="ArrowDownToLine" size={20} className="mr-2" />
                Вывести средства
              </Button>
              <Button variant="outline" size="lg" className="h-16 border-red-500 text-red-500 hover:bg-red-500/10">
                <Icon name="AlertCircle" size={20} className="mr-2" />
                SOS
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default Index;
