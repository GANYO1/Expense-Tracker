from app.models import db
from sqlalchemy import CheckConstraint
from sqlalchemy.orm import validates
from datetime import datetime

class Income(db.Model):
    __tablename__ = 'incomes'

    id = db.Column(db.Integer, primary_key=True)
    amount = db.Column(db.Numeric(12, 2), nullable=False)
    source = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(255), nullable=True)
    date = db.Column(db.Date, nullable=False, index=True)

    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'), nullable=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        CheckConstraint('amount > 0', name='check_amount_positive'),
    )

    @validates('amount')
    def validate_amount(self, amount):
        if amount is None:
            raise ValueError('Amount is required')
        if not isinstance(amount, (int, float)) or amount <= 0:
            raise ValueError('Amount must be a number greater than zero')
        return amount

    
    def to_dict(self):
        return {
            'id': self.id,
            'amount': self.amount,
            'source': self.source,
            'description': self.description,
            'date': self.date.isoformat() if self.date else None,
            'category_id': self.category_id,
            'user_id': self.user_id,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

    def __repr__(self):
        return f'<Income {self.id} - {self.source} ({self.amount})>'